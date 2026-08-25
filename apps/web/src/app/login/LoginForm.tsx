'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login, signup, loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useActionState } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const [state, formAction, pending] = useActionState(login, null)
  
  const error = state?.error || urlError

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
          {error}
        </div>
      )}
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
