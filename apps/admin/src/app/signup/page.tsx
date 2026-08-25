import { signup } from '@/app/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getURL } from '@/utils/url'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/')
  }
  
  // Google Auth Action
  const signInWithGoogle = async () => {
    'use server'
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    })
    if (data.url) {
      const { redirect } = await import('next/navigation')
      redirect(data.url)
    }
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Create an Account
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Join Nestara Estates to list and save properties.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <form className="space-y-4" action={signup as any}>
            {resolvedParams?.error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-500 dark:bg-red-950/50">
                {resolvedParams.error}
              </div>
            )}
            
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <div className="mt-1">
                <Input id="full_name" name="full_name" type="text" required placeholder="John Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>I am a...</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 flex-1 justify-center bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                  <input type="radio" name="role" value="BUYER" defaultChecked className="accent-amber-500" />
                  <span className="text-sm font-medium">Buyer / Owner</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer border rounded-md p-3 flex-1 justify-center bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                  <input type="radio" name="role" value="DEALER" className="accent-amber-500" />
                  <span className="text-sm font-medium">Nestara Dealer</span>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-1">
                <Input id="email" name="email" type="email" required placeholder="nestara@example.com" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-1">
                <Input id="password" name="password" type="password" required />
              </div>
            </div>

            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <div className="mt-1">
                <Input id="confirm_password" name="confirm_password" type="password" required />
              </div>
            </div>

            <Button type="submit" className="w-full bg-amber-500 text-white hover:bg-amber-600">
              Sign up
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-950">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            <div className="mt-6">
              <form action={signInWithGoogle}>
                <Button type="submit" variant="outline" className="w-full border-zinc-200 dark:border-zinc-800">
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
              </form>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-zinc-500">Already have an account? </span>
            <Link href="/login" className="font-semibold text-amber-600 hover:text-amber-500">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
