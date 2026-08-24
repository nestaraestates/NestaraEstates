'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(propertyId: string, currentPath: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to save properties.' }
  }

  // Check if it already exists
  const { data: existing } = await supabase
    .from('saved_properties')
    .select('id')
    .eq('user_id', user.id)
    .eq('property_id', propertyId)
    .single()

  if (existing) {
    // Remove it
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('id', existing.id)
      
    if (error) return { error: 'Failed to remove from saved properties.' }
  } else {
    // Add it
    const { error } = await supabase
      .from('saved_properties')
      .insert({ user_id: user.id, property_id: propertyId })
      
    if (error) return { error: 'Failed to save property.' }
  }

  revalidatePath(currentPath)
  revalidatePath('/dashboard/buyer')
  
  return { success: true, isFavorited: !existing }
}
