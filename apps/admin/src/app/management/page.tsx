import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Link from 'next/link'
import { promoteToAdmin, demoteFromAdmin } from './actions'
import { isSuperAdmin } from '@/lib/admin'

export default async function ManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isSuper = isSuperAdmin(user?.email)

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,custom_id.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: profiles, error } = await query

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">User Management</h1>
          <p className="text-zinc-500">Manage user accounts, suspend users, and assign admin roles.</p>
        </div>
        
        <form method="GET" action="/management" className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input 
              type="search" 
              name="q"
              placeholder="Search by name..." 
              className="pl-9 bg-white"
              defaultValue={q}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {q ? `Search results for "${q}"` : 'A list of all users registered in the system.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">Failed to load users: {error.message}</div>
          ) : profiles && profiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-500">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">User Details</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    {isSuper && <th className="px-4 py-3 font-semibold">Access Grant</th>}
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((profile) => (
                      <tr key={profile.id} className="border-b hover:bg-zinc-50">
                        <td className="px-4 py-3">
                          <Link href={`/management/${profile.id}`} className="block hover:underline">
                            <div className="font-medium text-blue-600 dark:text-blue-400">{profile.full_name || 'Unknown User'}</div>
                            <div className="text-sm text-zinc-500">{profile.email}</div>
                            <div className="text-xs text-zinc-400 font-mono mt-0.5" title={profile.id}>{profile.custom_id}</div>
                          </Link>
                        </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${profile.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                          {profile.role || 'user'}
                        </span>
                      </td>
                      {isSuper && (
                        <td className="px-4 py-3">
                          {profile.role !== 'admin' ? (
                            <form action={async () => {
                              'use server'
                              await promoteToAdmin(profile.id)
                            }}>
                              <Button type="submit" variant="outline" size="sm" className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200">
                                Promote to Admin
                              </Button>
                            </form>
                          ) : (
                            <form action={async () => {
                              'use server'
                              await demoteFromAdmin(profile.id)
                            }}>
                              <Button type="submit" variant="outline" size="sm" className="text-zinc-600">
                                Remove Admin
                              </Button>
                            </form>
                          )}
                        </td>
                      )}
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
            <div className="text-zinc-500 text-center py-8">
              {q ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
