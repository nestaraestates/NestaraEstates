import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from '@/components/dashboard/ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in.</div>
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Profile Settings</h1>
      <ProfileForm profile={profile || { id: user.id }} />
    </div>
  )
}
