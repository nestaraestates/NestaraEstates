'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const fullName = formData.get('full_name') as string
  const phoneNumber = formData.get('phone_number') as string
  const role = formData.get('role') as string

  // Update profile
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phoneNumber,
      role: role
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Also update user metadata
  await supabase.auth.updateUser({
    data: { role: role, full_name: fullName }
  })

  if (role === 'DEALER') {
    redirect('/dashboard/seller')
  } else {
    redirect('/dashboard/buyer')
  }
}
