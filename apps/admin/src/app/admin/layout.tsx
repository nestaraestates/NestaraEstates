import { LayoutDashboard } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin'
import { AdminDesktopNav, AdminMobileNav } from '@/components/admin/AdminNav'
import { NotificationBell } from '@/components/layout/NotificationBell'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isSuper = isSuperAdmin(user.email)
  const isAssignedAdmin = profile?.role === 'admin'

  if (!isSuper && !isAssignedAdmin) {
    redirect('/')
  }

  let unreadCount = 0
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
  unreadCount = count || 0

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col flex-shrink-0 z-20 shadow-sm">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-100 px-6 bg-white">
          <div className="h-8 w-8 bg-blue-600 rounded-lg shadow-sm flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-black text-zinc-900 tracking-tight">Nestara<span className="text-blue-600">OS</span></span>
        </div>
        
        <AdminDesktopNav />
        
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-9 w-9 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 border border-blue-200">
                {user.email?.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-zinc-900 truncate">{user.email}</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                  {isSuper ? 'System Admin' : 'Staff Agent'}
                </div>
              </div>
            </div>
            <NotificationBell initialCount={unreadCount} userId={user.id} />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen w-full relative z-0 pb-16 md:pb-0 overflow-hidden bg-zinc-50/50">
        {/* Mobile Header */}
        <header className="md:hidden flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 flex-shrink-0 z-10 sticky top-0 shadow-sm">
          <span className="text-base font-black text-zinc-900 tracking-tight">Nestara<span className="text-blue-600">OS</span></span>
          <div className="flex items-center gap-3">
            <NotificationBell initialCount={unreadCount} userId={user.id} />
            <div className="h-7 w-7 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-200">
              {user.email?.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>

      <AdminMobileNav />
    </div>
  )
}
