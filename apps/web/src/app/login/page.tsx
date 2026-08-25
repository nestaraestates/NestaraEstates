import { Suspense } from 'react'
import { loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building } from 'lucide-react'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-inner">
              <Building className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-zinc-500">Sign in to your Nestara account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Suspense fallback={<div className="h-40 animate-pulse bg-zinc-100 rounded-lg"></div>}>
              <LoginForm />
            </Suspense>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-100 p-6 dark:border-zinc-900">
          <div className="text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold text-amber-600 hover:text-amber-500">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
