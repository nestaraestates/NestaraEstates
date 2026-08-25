import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck } from 'lucide-react'
import { verifyResetCode } from './actions'

export default async function VerifyResetCodePage({ searchParams }: { searchParams: Promise<{ email?: string, error?: string }> }) {
  const resolvedParams = await searchParams;
  const email = resolvedParams.email || '';
  const error = resolvedParams.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <Card className="w-full max-w-md border-zinc-200 shadow-xl dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-inner">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Enter Reset Code</CardTitle>
          <CardDescription className="text-zinc-500">
            We sent a 6-digit verification code to <strong>{email}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
                {error}
              </div>
            )}
            
            <form action={verifyResetCode} className="space-y-4">
              <input type="hidden" name="email" value={email} />
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input 
                  id="code" 
                  name="code" 
                  type="text" 
                  placeholder="123456" 
                  required 
                  maxLength={6}
                  className="bg-white dark:bg-zinc-900 text-center text-lg tracking-widest font-mono" 
                />
              </div>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                Verify Code
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
