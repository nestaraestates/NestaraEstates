'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Building, MessageSquare, Store, Target } from 'lucide-react'

export function AdminDesktopNav() {
  const pathname = usePathname()

  const links = [
    { name: 'Home', href: '/', icon: LayoutDashboard, matchExact: true },
    { name: 'Seller Hub', href: '/seller-hub', icon: Store, matchExact: false },
    { name: 'Buyer Hub', href: '/buyer-hub', icon: Users, matchExact: false },
    { name: 'Messages', href: '/messages', icon: MessageSquare, matchExact: false },
    { name: 'All Properties', href: '/properties', icon: Building, matchExact: false },
    { name: 'Enquired Properties', href: '/enquired', icon: Target, matchExact: false },
    { name: 'Management', href: '/management', icon: Users, matchExact: false },
  ]

  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 mt-2">
      <div className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3 px-3">Main Menu</div>
      
      {links.map((link) => {
        const Icon = link.icon
        const isActive = link.matchExact ? pathname === link.href : pathname?.startsWith(link.href)
        
        return (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
            isActive ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' : 'hover:bg-zinc-100 text-zinc-600 hover:text-blue-600'
          }`}>
            <Icon className="h-4 w-4" /> {link.name}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminMobileNav() {
  const pathname = usePathname()

  const links = [
    { name: 'Home', href: '/', icon: LayoutDashboard, matchExact: true },
    { name: 'Sellers', href: '/seller-hub', icon: Store, matchExact: false },
    { name: 'Buyers', href: '/buyer-hub', icon: Users, matchExact: false },
    { name: 'Msgs', href: '/messages', icon: MessageSquare, matchExact: false },
    { name: 'Assets', href: '/properties', icon: Building, matchExact: false },
    { name: 'Leads', href: '/enquired', icon: Target, matchExact: false },
    { name: 'Manage', href: '/management', icon: Users, matchExact: false },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-zinc-200 flex justify-around items-center px-1 z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = link.matchExact ? pathname === link.href : pathname?.startsWith(link.href)
        
        return (
          <Link key={link.href} href={link.href} className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
            isActive ? 'text-blue-600' : 'text-zinc-400 hover:text-blue-600'
          }`}>
            <Icon className="h-5 w-5" />
            <span className="text-[9px] font-bold truncate px-1 max-w-full">{link.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
