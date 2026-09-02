import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'

export default async function ManagementPage() {
  const supabase = await createClient()
  const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Management</h1>
        <p className="text-zinc-500">Manage user accounts, suspend users, and assign roles.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users registered in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">Failed to load users: {error.message}</div>
          ) : profiles && profiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-500">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User ID</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                    <tr key={profile.id} className="border-b hover:bg-zinc-50">
                      <td className="px-4 py-3 font-medium text-zinc-900">{profile.id}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {profile.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2 flex">
                        <Button variant="outline" size="sm">Suspend</Button>
                        <Button variant="destructive" size="sm">Ban</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-zinc-500 text-center py-8">No users found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
