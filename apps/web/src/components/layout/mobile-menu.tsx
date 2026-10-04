'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MobileMenu({ isProfessional, user, onSignOut }: { isProfessional?: boolean, user: any, onSignOut: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const links = [
    { name: 'Buy', href: '/buy' },
    { name: 'Rent', href: '/rent' },
    { name: 'Commercial', href: '/commercial' },
    { name: 'Build Home', href: '/build-your-home' },
    { name: 'Hire Pros', href: '/professionals' },
    isProfessional ? { name: 'Pro Dashboard', href: '/dashboard/professional' } : { name: 'Join as Pro', href: '/join-professional' },
    { name: 'Verification', href: '/verification' },
    { name: 'Tools', href: '/tools' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: '📱 Get the Android App', href: '/downloads' },
    { name: 'List Your Property', href: '/list-property' },
  ]

  return (
    <div className="md:hidden">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-zinc-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-16 w-full max-h-[calc(100dvh-4rem)] overflow-y-auto bg-white border-b border-zinc-200 p-4 flex flex-col gap-3 shadow-lg z-50 dark:bg-zinc-950 dark:border-zinc-800">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium px-2 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-500 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
          {user ? (
            <button 
              onClick={() => { setIsOpen(false); onSignOut(); }}
              className="text-left text-base font-medium px-2 py-2 rounded-md text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-950/30"
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-left text-base font-medium px-2 py-2 rounded-md text-brand-600 hover:bg-brand-50 dark:text-brand-500 dark:hover:bg-brand-950/30"
            >
              Log In
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
