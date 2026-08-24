import Link from 'next/link'
import { Building, User, LogOut, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NavLinks } from './nav-links'
import { NotificationBell } from './NotificationBell'
import { MobileMenu } from './mobile-menu'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let unreadCount = 0
  if (user) {
    // Try to get unread count (fails silently if table not created yet)
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    unreadCount = count || 0
  }

  const signOut = async () => {
    'use server'
    const supabaseAction = await createClient()
    await supabaseAction.auth.signOut()
    redirect('/login')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-md bg-zinc-900 p-1.5 text-amber-500 dark:bg-zinc-100 dark:text-amber-600">
              <Building className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Nestara</span>
          </Link>
          <NavLinks />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/list-property" className="hidden sm:block">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950/30">
              List Your Property
            </Button>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-1 md:gap-2">
              <NotificationBell initialCount={unreadCount} userId={user.id} />
              <Link href="/inbox">
                <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30">
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Inbox</span>
                </Button>
              </Link>
              <Link href="/dashboard/buyer">
                <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700 dark:text-amber-500">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Button>
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                <User className="h-5 w-5" />
                <span className="sr-only">Log in</span>
              </Button>
            </Link>
          )}
          
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

