'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getURL } from '@/utils/url'
import { createClient } from '@/utils/supabase/server'
import { isSuperAdmin } from '@/lib/admin'

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

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single()
    const isSuper = isSuperAdmin(authData.user.email)
    const isAssignedAdmin = profile?.role === 'admin'

    if (!isSuper && !isAssignedAdmin) {
      await supabase.auth.signOut()
      return { error: 'Unauthorized: You do not have admin privileges for this portal.' }
    }

    return { success: true }
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
    redirect('/')
  } else {
    redirect('/')
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

  if (error || !data.url) {
    return { error: 'Could not authenticate with Google' }
  }

  return { success: true, url: data.url }
}
