import { Shield, LayoutDashboard, Users, Building, FileCheck, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-zinc-300 dark:bg-black border-r border-zinc-800 hidden md:block flex-shrink-0">
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-6">
          <Shield className="h-6 w-6 text-amber-500" />
          <span className="text-lg font-bold text-white">Nestara Admin</span>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg bg-zinc-800 px-3 py-2 text-white transition-colors">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/admin/properties" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800 hover:text-white transition-colors">
            <Building className="h-4 w-4" /> Properties
          </Link>
          <Link href="/admin/verifications" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800 hover:text-white transition-colors">
            <FileCheck className="h-4 w-4" /> Verifications
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800 hover:text-white transition-colors">
            <Users className="h-4 w-4" /> Users & Dealers
          </Link>
          <Link href="/admin/leads" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800 hover:text-white transition-colors">
            <MessageSquare className="h-4 w-4" /> Enquiries
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
