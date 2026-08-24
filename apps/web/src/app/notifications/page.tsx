export const runtime = "edge";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { BellRing, CheckCircle2, MessageSquare, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Mark all unread as read immediately
  if (notifications && notifications.some(n => !n.is_read)) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
  }

  const clearAll = async () => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.from('notifications').delete().eq('user_id', user.id)
      if (error) console.error("Error clearing notifications:", error)
      revalidatePath('/notifications')
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-100 text-zinc-600 p-3 rounded-2xl">
            <BellRing className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Notifications</h1>
            <p className="text-zinc-500 font-medium">Updates, alerts, and account activity</p>
          </div>
        </div>

        {notifications && notifications.length > 0 && (
          <form action={clearAll}>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </form>
        )}
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[400px]">
        {(!notifications || notifications.length === 0) ? (
          <div className="flex flex-col items-center justify-center text-center h-[350px]">
            <div className="bg-zinc-50 rounded-full p-6 mb-4">
              <BellRing className="h-12 w-12 text-zinc-300" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">You're all caught up!</h2>
            <p className="text-zinc-500">There are no new notifications for your account.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div 
                key={notif.id} 
                className={`p-5 rounded-2xl border transition-colors ${notif.is_read ? 'bg-white border-zinc-200' : 'bg-blue-50/50 border-blue-200 shadow-sm'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full mt-1 ${notif.title.includes('Message') ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {notif.title.includes('Message') ? <MessageSquare className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-base font-bold ${notif.is_read ? 'text-zinc-900' : 'text-blue-900'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs font-medium text-zinc-400">
                        {new Date(notif.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric',
                          hour: 'numeric', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className={`text-sm mb-3 ${notif.is_read ? 'text-zinc-600' : 'text-zinc-800'}`}>
                      {notif.content}
                    </p>
                    {notif.link && (
                      <Link href={notif.link} className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-700">
                        View Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
