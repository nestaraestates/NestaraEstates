'use client'

import Link from 'next/link'
import { Building, Smartphone, User, LogOut, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { NavLinks } from './nav-links'
import { NotificationBell } from './NotificationBell'
import { MobileMenu } from './mobile-menu'
import { MobileBottomNav } from './MobileBottomNav'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useLocation } from './LocationContext'
import { MapPin } from 'lucide-react'
import { LocationPickerModal } from './LocationPickerModal'

export function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { location, isLocating } = useLocation()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
        setUnreadCount(count || 0)
      }
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <>
      <LocationPickerModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Nestara Estates" className="h-10 w-auto object-contain" />
            </Link>
            <Button 
              variant="ghost" 
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <MapPin className="h-4 w-4" />
              {isLocating ? '...' : (location.city || 'Anywhere')}
            </Button>
            <NavLinks />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              className="sm:hidden flex items-center gap-1 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 p-2"
              onClick={() => setIsLocationModalOpen(true)}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Link href="/downloads" target="_blank">
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-500 dark:hover:bg-emerald-950/30 font-bold hidden sm:flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Get App
              </Button>
            </Link>

            <div className="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
              <Link href="/buy" className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">Buy</Link>
              <Link href="/rent" className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">Rent</Link>
              <Link href="/commercial" className="text-[13px] font-medium text-zinc-600 dark:text-zinc-300 whitespace-nowrap">Commercial</Link>
              <Link href="/build-your-home" className="text-[13px] font-medium text-brand-600 dark:text-brand-500 whitespace-nowrap">Build</Link>
              <Link href="/join-professional" className="text-[13px] font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">Pro</Link>
            </div>
            
            <Link href="/list-property" className="hidden sm:block">
              <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950/30">
                List Your Property
              </Button>
            </Link>
            
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <NotificationBell initialCount={unreadCount} userId={user.id} />
                <Link href="/inbox">
                  <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30">
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
                <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400">
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Log out</span>
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden md:block">
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
      <MobileBottomNav user={user} unreadCount={unreadCount} />
    </>
  )
}
