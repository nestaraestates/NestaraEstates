'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, signup, loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useActionState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export function LoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const [state, formAction, pending] = useActionState(login, null)
  
  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      const separator = state.redirectTo.includes('?') ? '&' : '?'
      window.location.href = `${state.redirectTo}${separator}success=Login+successful`
    }
  }, [state])

  const error = state?.error || urlError

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
          {error}
        </div>
      )}

      <Button 
        type="button" 
        onClick={async () => {
          const supabase = createClient()
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          })
        }}
        variant="outline" 
        className="w-full font-medium"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </Button>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950">Or continue with email</span>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-white dark:bg-zinc-900" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-amber-600 hover:text-amber-500 font-medium">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required className="bg-white dark:bg-zinc-900" />
        </div>
        <Button type="submit" disabled={pending} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
