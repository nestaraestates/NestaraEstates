'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitEnquiry(formData: FormData) {
  const supabase = await createClient()

  // Optional: check if logged in to link user, otherwise guest
  const { data: { user } } = await supabase.auth.getUser()

  const property_id = formData.get('property_id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const message = formData.get('message') as string

  const { error } = await supabase.from('enquiries').insert({
    property_id,
    user_id: user?.id || null,
    name,
    email,
    phone,
    message,
    status: 'NEW'
  })

  if (error) {
    console.error('Error submitting enquiry:', error)
    return { error: 'Failed to send enquiry.' }
  }

  revalidatePath(`/property/${property_id}`)
  return { success: true }
}
