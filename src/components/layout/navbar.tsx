import Link from 'next/link'
import { Building, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
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
          <nav className="hidden md:ml-8 md:flex md:gap-6">
            <Link href="/buy" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Buy</Link>
            <Link href="/rent" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Rent</Link>
            <Link href="/commercial" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">Commercial</Link>
            <Link href="/verification" className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 transition-colors">Verification</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/list-property" className="hidden sm:block">
            <Button variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-500 dark:hover:bg-amber-950/30">
              List Your Property
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden text-zinc-600">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
