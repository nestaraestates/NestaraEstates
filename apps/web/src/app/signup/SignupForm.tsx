'use client'

import { useSearchParams } from 'next/navigation'
import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignupForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
          {error}
        </div>
      )}
      <form action={signup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-white dark:bg-zinc-900" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required className="bg-white dark:bg-zinc-900" />
          <p className="text-xs text-zinc-500">Must be at least 6 characters</p>
        </div>
        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          Create Account
        </Button>
      </form>
    </div>
  )
}
