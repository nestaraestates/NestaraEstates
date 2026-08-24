'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProperty(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'You must be logged in to edit a property.' }
  }

  const property_id = formData.get('property_id') as string
  if (!property_id) return { error: 'Property ID missing.' }

  // Verify ownership
  const { data: existingProp } = await supabase.from('properties').select('owner_id').eq('id', property_id).single()
  if (existingProp?.owner_id !== user.id) {
    return { error: 'You do not have permission to edit this property.' }
  }

  const title = formData.get('title') as string
  const price = parseFloat(formData.get('price') as string) || 0
  const description = formData.get('description') as string
  const status = formData.get('status') as string

  const { error } = await supabase
    .from('properties')
    .update({ title, price, description, status })
    .eq('id', property_id)

  if (error) {
    console.error('Error updating property:', error)
    return { error: 'Failed to update property.' }
  }

  revalidatePath('/dashboard/seller')
  revalidatePath(`/property/${property_id}`)
  revalidatePath('/buy')
  revalidatePath('/rent')
  
  redirect(`/property/${property_id}`)
}
