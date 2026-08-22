'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveProperty(propertyId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ 
      is_verified: true, 
      verification_status: 'VERIFIED' 
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Error approving property:', error)
    return { error: 'Failed to approve property' }
  }

  revalidatePath('/admin')
  revalidatePath('/buy')
  revalidatePath('/rent')
  return { success: true }
}

export async function rejectProperty(propertyId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ 
      is_verified: false, 
      verification_status: 'REJECTED' 
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Error rejecting property:', error)
    return { error: 'Failed to reject property' }
  }

  revalidatePath('/admin')
  return { success: true }
}
