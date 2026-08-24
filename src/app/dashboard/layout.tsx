'use client'

import { User, Heart, Building, MessageSquare, Inbox } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')

  // Helper to determine active state
  const isActive = (path: string, expectedTab?: string) => {
    if (expectedTab) {
      return pathname === path && tab === expectedTab
    }
    return pathname === path && !tab
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 max-w-7xl">
      {/* Sidebar */}
      <aside className="w-full md:w-72 flex-shrink-0">
        <div className="mb-6 px-4">
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">My Account</h2>
          <p className="text-zinc-500 text-sm mt-1">Manage your properties and profile</p>
        </div>
        <nav className="flex flex-col gap-2">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-4 mt-4 mb-1">Buying & Renting</div>
          
          <Link href="/dashboard/buyer?tab=saved" className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isActive('/dashboard/buyer', 'saved') ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <Heart className={`h-5 w-5 ${isActive('/dashboard/buyer', 'saved') ? 'text-amber-600' : 'text-zinc-400'}`} /> 
            Saved Properties
          </Link>
          
          <Link href="/dashboard/buyer?tab=enquiries" className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isActive('/dashboard/buyer', 'enquiries') ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <MessageSquare className={`h-5 w-5 ${isActive('/dashboard/buyer', 'enquiries') ? 'text-amber-600' : 'text-zinc-400'}`} /> 
            My Enquiries
          </Link>

          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-4 mt-6 mb-1">Selling & Leasing</div>
          
          <Link href="/dashboard/seller?tab=listings" className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isActive('/dashboard/seller', 'listings') ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <Building className={`h-5 w-5 ${isActive('/dashboard/seller', 'listings') ? 'text-blue-600' : 'text-zinc-400'}`} /> 
            My Listings
          </Link>


          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-4 mt-6 mb-1">Account</div>

          <Link href="/dashboard/profile" className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all ${isActive('/dashboard/profile') ? 'bg-zinc-900 text-white shadow-sm border border-zinc-800' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}>
            <User className={`h-5 w-5 ${isActive('/dashboard/profile') ? 'text-zinc-300' : 'text-zinc-400'}`} /> 
            Profile Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[600px]">
        {children}
      </main>
    </div>
  )
}
