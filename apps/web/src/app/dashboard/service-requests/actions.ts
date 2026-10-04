'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteServiceRequest(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { error } = await supabase
    .from('service_requests')
    .delete()
    .eq('id', id)
    .eq('customer_id', user.id) // Security check

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/service-requests')
  return { success: true }
}
