import { Suspense } from 'react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 max-w-7xl">
      <Suspense fallback={<div className="w-full md:w-72 h-screen bg-zinc-50 animate-pulse rounded-xl" />}>
        <DashboardSidebar />
      </Suspense>

      <main className="flex-1 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[600px]">
        {children}
      </main>
    </div>
  )
}
