import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingForm } from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if already onboarded (has phone number)
  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number, role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.phone_number) {
    if (profile.role === 'DEALER') {
      redirect('/dashboard/seller')
    } else {
      redirect('/dashboard/buyer')
    }
  }

  // Determine if the user signed in with an OAuth provider and needs a password
  const providers = user.app_metadata?.providers || []
  const needsPassword = providers.includes('google') && !providers.includes('email')

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Complete Your Profile</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Tell us a bit more about yourself to get started.
          </p>
        </div>
        
        <OnboardingForm initialName={profile?.full_name || ''} needsPassword={needsPassword} />
      </div>
    </div>
  )
}
