'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { isSuperAdmin } from '@/lib/admin'

export async function promoteToAdmin(userId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
    
  const isSuper = isSuperAdmin(user.email)
  if (!isSuper) {
    throw new Error('Only Super Admins can promote users')
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
    
  const isSuper = isSuperAdmin(user.email)
  if (!isSuper) {
    throw new Error('Only Super Admins can demote users')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/management')
}
