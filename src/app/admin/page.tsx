import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, Users, FileCheck, MessageSquare } from 'lucide-react'

export default function AdminDashboardPage() {
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
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-green-500 mt-1">+12 this week</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Verifications</CardTitle>
            <FileCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-amber-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Users</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,520</div>
            <p className="text-xs text-zinc-500 mt-1">Buyers, Sellers, Dealers</p>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 last:border-0">
                  <div>
                    <p className="text-sm font-medium">Luxury Villa in Cyber City</p>
                    <p className="text-xs text-zinc-500">Verification pending</p>
                  </div>
                  <button className="text-xs text-amber-600 hover:underline">Review</button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
