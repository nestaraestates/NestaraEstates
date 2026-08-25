'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function verifyResetCode(formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('code') as string
  
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery'
  })

  if (error) {
    return redirect(`/verify-reset-code?email=${encodeURIComponent(email)}&error=Invalid or expired code`)
  }

  // Once verified, the user is logged in with a session.
  // We can now redirect them to set a new password.
  return redirect('/update-password')
}
