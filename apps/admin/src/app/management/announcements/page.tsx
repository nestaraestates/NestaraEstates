import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Megaphone, Send } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BroadcastForm } from './BroadcastForm'

export const dynamic = 'force-dynamic'

export default async function AnnouncementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-indigo-600" />
          Global Announcements
        </h1>
        <p className="text-zinc-500 mt-1 text-sm md:text-base">
          Send an important alert to every single registered user in Nestara Estates.
          This will trigger an in-app notification and an OS-level Push Notification.
        </p>
      </div>

      <Card className="p-6 md:p-8 shadow-sm border-zinc-200">
        <BroadcastForm />
      </Card>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
        <strong>Warning:</strong> Broadcasting will immediately send a push notification to thousands of devices. Please proofread your announcement before sending.
      </div>
    </div>
  )
}
