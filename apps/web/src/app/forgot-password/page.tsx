import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { forgotPassword } from './actions'

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ message?: string, error?: string }> }) {
  const resolvedParams = await searchParams;
  const message = resolvedParams.message;
  const error = resolvedParams.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-inner">
              <Building className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
          <CardDescription className="text-zinc-500">
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {message && (
              <div className="p-3 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/50">
                {message}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
                {error}
              </div>
            )}
            
            <form action={forgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="bg-white dark:bg-zinc-900" />
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                Send Reset Link
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-zinc-100 p-6 dark:border-zinc-900">
          <Link href="/login" className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
