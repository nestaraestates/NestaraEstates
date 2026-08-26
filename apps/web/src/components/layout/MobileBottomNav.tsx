'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, User, MessageSquare } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export function MobileBottomNav({ user, unreadCount }: { user: SupabaseUser | null, unreadCount: number }) {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/buy', icon: Search },
    { name: 'Sell', href: '/list-property', icon: PlusCircle, isMain: true },
    { name: 'Inbox', href: '/inbox', icon: MessageSquare, badge: unreadCount },
    { name: 'Profile', href: user ? '/dashboard/buyer' : '/login', icon: User },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 pb-3 pt-1 px-2 dark:bg-zinc-950 dark:border-zinc-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          if (item.isMain) {
            return (
              <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full relative -top-3">
                <div className="bg-amber-500 text-white rounded-full p-3 shadow-lg flex items-center justify-center">
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium mt-1 text-zinc-600 dark:text-zinc-400">{item.name}</span>
              </Link>
            )
          }

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full relative">
              <div className={`p-1 ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                <item.icon className="h-5 w-5" />
                {item.badge ? (
                  <span className="absolute top-0 right-[25%] flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
