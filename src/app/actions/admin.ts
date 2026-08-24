'use server'

import { createClient } from '@/utils/supabase/server'
import { isSuperAdmin } from '@/lib/admin'

export async function updateLeadStatus(leadId: string, newStatus: string) {
  const supabase = await createClient()

  // Security check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!isSuperAdmin(user.email) && profile?.role !== 'admin') {
    return { error: 'Forbidden' }
  }

  const { error } = await supabase
    .from('enquiries')
    .update({ status: newStatus })
    .eq('id', leadId)

  if (error) {
    console.error('Failed to update lead status:', error)
    return { error: 'Database update failed' }
  }

  return { success: true }
}
