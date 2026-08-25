'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return redirect('/update-password?error=Could not update password')
  }

  // Redirect to dashboard after successful password update
  return redirect('/dashboard/buyer')
}
