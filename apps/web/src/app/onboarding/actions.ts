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
  const password = formData.get('password') as string

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

  // Update user metadata and conditionally set password
  const updateData: any = {
    data: { role: role, full_name: fullName }
  }
  
  if (password) {
    updateData.password = password
  }

  await supabase.auth.updateUser(updateData)

  if (role === 'DEALER') {
    redirect('/dashboard/seller?success=Profile+completed+successfully')
  } else {
    redirect('/dashboard/buyer?success=Profile+completed+successfully')
  }
}
