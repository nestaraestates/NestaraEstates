'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  id: string
  full_name: string
  phone: string
  address: string
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      address: data.address
    })
    .eq('id', data.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/profile')
  return { success: true }
}
