import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Notifications</h1>
        <p className="text-zinc-500 mt-2">Manage your alerts and system notifications.</p>
      </div>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>You have no new notifications.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
            <p className="text-zinc-500 font-medium">All caught up!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
