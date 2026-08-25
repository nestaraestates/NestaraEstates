'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getURL } from '@/utils/url'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
  try {
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error || !authData.user) {
      return { error: error?.message || 'Could not authenticate user' }
    }

    const role = authData.user.user_metadata?.role
    return { success: true, redirectTo: role === 'DEALER' ? '/dashboard/seller' : '/dashboard/buyer' }
  } catch (err: any) {
    console.error('Login error:', err)
    return { error: err.message || 'An unexpected error occurred during login' }
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string


  const role = formData.get('role') as string || 'USER'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split('@')[0], // Fallback if missing
        role: role
      }
    }
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (role === 'DEALER') {
    redirect('/dashboard/seller')
  } else {
    redirect('/dashboard/buyer')
  }
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getURL()}auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=Could not authenticate with Google')
  }

  if (data.url) {
    redirect(data.url) // Redirect to Google OAuth page
  }
}
