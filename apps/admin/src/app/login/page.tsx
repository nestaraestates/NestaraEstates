import { login, signup, loginWithGoogle } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Building } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Suspense } from 'react'
import { AdminLoginForm } from './AdminLoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = typeof params.error === 'string' ? params.error : null
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/')
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-zinc-900 p-3 text-amber-500 dark:bg-zinc-100 dark:text-amber-600">
              <Building className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
          <CardDescription className="text-zinc-500">
            Sign in to access the Nestara Estates dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400 text-left">
            <strong>Warning: Restricted Access</strong>
            <p className="mt-1">This portal is for authorized administrators only. Unauthorized access is prohibited.</p>
          </div>
          <Suspense fallback={<div className="h-40 animate-pulse bg-zinc-100 rounded-lg"></div>}>
            <AdminLoginForm />
          </Suspense>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-500">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-amber-600 hover:text-amber-500">
              Sign up
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 hover:underline dark:hover:text-zinc-100">
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
