'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavLinks() {
  const pathname = usePathname()

  const links = [
    { name: 'Buy', href: '/buy' },
    { name: 'Rent', href: '/rent' },
    { name: 'Commercial', href: '/commercial' },
    { name: 'Build Home', href: '/build-your-home' },
    { name: 'Professionals', href: '/join-professional' },
    { name: 'Tools', href: '/tools' },
  ]

  return (
    <nav className="hidden md:ml-8 md:flex md:gap-4">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              isActive
                ? 'text-amber-600 dark:text-amber-500 font-bold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}
