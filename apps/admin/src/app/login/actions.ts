'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error || !authData.user) {
    redirect('/login?error=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  const role = authData.user.user_metadata?.role
  if (role === 'DEALER') {
    redirect('/')
  } else {
    redirect('/') 
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  const fullName = formData.get('full_name') as string

  if (password !== confirmPassword) {
    redirect('/signup?error=Passwords do not match')
  }

  const role = formData.get('role') as string || 'BUYER'

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
    redirect('/signup?error=Could not sign up user')
  }

  revalidatePath('/', 'layout')
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
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=Could not authenticate with Google')
  }

  if (data.url) {
    redirect(data.url) // Redirect to Google OAuth page
  }
}
