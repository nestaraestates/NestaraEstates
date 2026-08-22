import { User, Heart, Building, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        <div className="mb-6 px-4">
          <h2 className="text-xl font-bold">My Account</h2>
        </div>
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard/buyer" className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <Heart className="h-5 w-5 text-amber-500" /> Saved Properties
          </Link>
          <Link href="/dashboard/seller" className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <Building className="h-5 w-5 text-amber-500" /> My Listings
          </Link>
          <Link href="/dashboard/buyer" className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <MessageSquare className="h-5 w-5 text-amber-500" /> My Enquiries
          </Link>
          <Link href="/dashboard/buyer" className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            <User className="h-5 w-5 text-amber-500" /> Profile Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
