import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { SignupForm } from './SignupForm'

;

import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://nestara-web.pages.dev';
  
  const signInWithGoogle = async () => {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
    if (data.url) {
      import('next/navigation').then(mod => mod.redirect(data.url))
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Join Nestara</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Create an account to save properties and contact owners.
          </p>
        </div>

        <div className="space-y-4">
          <form action={signInWithGoogle}>
            <Button variant="outline" className="w-full font-medium" type="submit">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950">Or continue with email</span>
            </div>
          </div>
          
          <Suspense fallback={<div className="h-40 animate-pulse bg-zinc-100 rounded-lg"></div>}>
            <SignupForm />
          </Suspense>

        </div>

        <div className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
