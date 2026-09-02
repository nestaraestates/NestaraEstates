'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { isSuperAdmin } from '@/lib/admin'

export async function promoteToAdmin(userId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
    
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isSuper = isSuperAdmin(user.email)
  const isAdmin = profile?.role === 'admin'
  
  if (!isSuper && !isAdmin) {
    throw new Error('Not authorized to promote users')
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/management')
}

export async function demoteFromAdmin(userId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
    
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isSuper = isSuperAdmin(user.email)
  
  // Only superadmins or the admin themselves can demote? Let's just say any admin can demote
  const isAdmin = profile?.role === 'admin'
  if (!isSuper && !isAdmin) {
    throw new Error('Not authorized to demote users')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/management')
}
