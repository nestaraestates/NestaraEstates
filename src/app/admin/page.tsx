import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, FileCheck, MessageSquare } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { approveProperty, rejectProperty } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Fetch pending properties
  const { data: pendingProperties } = await supabase
    .from('properties')
    .select('id, title, location, city, verification_status')
    .eq('verification_status', 'UNVERIFIED')
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch some stats
  const { count: totalProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true })
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats Cards */}
        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties || 0}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Verifications</CardTitle>
            <FileCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingProperties?.length || 0}</div>
            <p className="text-xs text-amber-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Users</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-green-500 mt-1">+8% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Property Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 border-zinc-200 dark:border-zinc-800 m-4 rounded-md">
            <p className="text-zinc-500">Activity Chart Placeholder</p>
          </CardContent>
        </Card>

        <Card className="col-span-3 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!pendingProperties?.length && <p className="text-sm text-zinc-500">No properties pending verification.</p>}
              {pendingProperties?.map((prop) => (
                <div key={prop.id} className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{prop.title}</p>
                    <p className="text-xs text-zinc-500">{prop.location}, {prop.city}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={async () => {
                      'use server'
                      await approveProperty(prop.id)
                    }}>
                      <button className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded hover:bg-emerald-100">Approve</button>
                    </form>
                    <form action={async () => {
                      'use server'
                      await rejectProperty(prop.id)
                    }}>
                      <button className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100">Reject</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
