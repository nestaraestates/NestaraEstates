import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutDashboard } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { isSuperAdmin } from '@/lib/admin'
import { AdminDesktopNav, AdminMobileNav } from '@/components/admin/AdminNav'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { SignOutButton } from '@/components/admin/SignOutButton'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NestaraOS Admin",
  description: "Nestara Estates Admin Dashboard",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If no user, just render children (which will be the login page)
  if (!user) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}>
          {children}
        </body>
      </html>
    )
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isSuper = isSuperAdmin(user.email)
  const isAssignedAdmin = profile?.role === 'admin'

  if (!isSuper && !isAssignedAdmin) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-zinc-50 flex items-center justify-center p-4`}>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 text-center max-w-md w-full">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-zinc-900 mb-2">Access Denied</h1>
            <p className="text-zinc-500 mb-6">You do not have administrator privileges to access this portal.</p>
            <div className="flex justify-center">
              <SignOutButton />
              <span className="ml-2 text-sm font-medium text-zinc-600 flex items-center">Sign Out</span>
            </div>
          </div>
        </body>
      </html>
    )
  }

  let unreadCount = 0
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
  unreadCount = count || 0

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-hidden`}>
        <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">
          {/* Desktop Sidebar */}
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
                <div className="flex items-center gap-2">
                  <NotificationBell initialCount={unreadCount} userId={user.id} />
                  <SignOutButton />
                </div>
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
                <SignOutButton />
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
      </body>
    </html>
  )
}
