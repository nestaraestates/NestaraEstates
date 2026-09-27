import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShieldAlert, ShieldCheck, User, UserX, MoreVertical, Key, Ban, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { promoteToAdmin, demoteFromAdmin, updateUserStatus } from './actions'
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
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">User Management</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Monitor user accounts, manage roles, and enforce security policies.</p>
        </div>
        
        <form method="GET" action="/management" className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              type="search" 
              name="q"
              placeholder="Search by name, email, or ID..." 
              className="pl-9 bg-white shadow-sm border-zinc-200 focus-visible:ring-zinc-900 rounded-lg"
              defaultValue={q}
            />
          </div>
          <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg shadow-sm">Search</Button>
        </form>
      </div>
      
      {/* Main Table Card */}
      <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Registered Users</h2>
            <p className="text-sm text-zinc-500 mt-1">
              {q ? `Found ${profiles?.length || 0} results for "${q}"` : `Total of ${profiles?.length || 0} users in the system.`}
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-red-500 bg-red-50/50 border-t border-red-100">
              <ShieldAlert className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="font-medium">Failed to load users</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
          ) : profiles && profiles.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">User</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Role</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Security Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {profiles.map((profile) => {
                  const isActive = profile.account_status === 'ACTIVE' || !profile.account_status
                  const isSuspended = profile.account_status === 'SUSPENDED'
                  const isBanned = profile.account_status === 'BANNED'
                  const isAdmin = profile.role === 'admin'
                  
                  // Generate Avatar Initials
                  const initials = profile.full_name 
                    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'U'

                  return (
                    <tr key={profile.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/management/${profile.id}`} className="flex items-center gap-4">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-inner border
                            ${isAdmin ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900 group-hover:text-indigo-600 transition-colors">
                              {profile.full_name || 'Unknown User'}
                            </div>
                            <div className="text-zinc-500 mt-0.5">{profile.email}</div>
                            <div className="text-[11px] font-mono text-zinc-400 mt-1" title={profile.id}>ID: {profile.custom_id}</div>
                          </div>
                        </Link>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                            </span>
                          )}
                          {isSuspended && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Suspended
                            </span>
                          )}
                          {isBanned && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/60">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Banned
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex w-fit items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase
                            ${isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'}`}>
                            {isAdmin ? <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> : <User className="h-3.5 w-3.5 mr-1.5" />}
                            {profile.role || 'User'}
                          </span>
                          
                          {isSuper && (
                            <div className="mt-1">
                              {!isAdmin ? (
                                <form action={async () => { 'use server'; await promoteToAdmin(profile.id); }}>
                                  <button type="submit" className="text-xs text-indigo-600 font-medium hover:text-indigo-800 hover:underline flex items-center gap-1">
                                    <Key className="h-3 w-3" /> Grant Admin
                                  </button>
                                </form>
                              ) : (
                                <form action={async () => { 'use server'; await demoteFromAdmin(profile.id); }}>
                                  <button type="submit" className="text-xs text-rose-600 font-medium hover:text-rose-800 hover:underline flex items-center gap-1">
                                    Revoke Admin
                                  </button>
                                </form>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {isSuspended ? (
                            <form action={async () => { 'use server'; await updateUserStatus(profile.id, 'ACTIVE'); }}>
                              <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 shadow-sm">
                                <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500" /> Unsuspend
                              </Button>
                            </form>
                          ) : (
                            <form action={async () => { 'use server'; await updateUserStatus(profile.id, 'SUSPENDED'); }}>
                              <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 shadow-sm">
                                Suspend
                              </Button>
                            </form>
                          )}

                          {isBanned ? (
                            <form action={async () => { 'use server'; await updateUserStatus(profile.id, 'ACTIVE'); }}>
                              <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm">
                                Remove Ban
                              </Button>
                            </form>
                          ) : (
                            <form action={async () => { 'use server'; await updateUserStatus(profile.id, 'BANNED'); }}>
                              <Button type="submit" variant="outline" size="sm" className="h-8 bg-red-50 border-red-200 text-red-700 hover:bg-red-100 shadow-sm">
                                <Ban className="h-4 w-4 mr-1.5" /> Ban
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-50/50">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 mb-1">No users found</h3>
              <p className="text-zinc-500 max-w-sm">
                {q ? `We couldn't find any users matching "${q}". Try adjusting your search term.` : 'There are no users registered in the system yet.'}
              </p>
              {q && (
                <Link href="/management" className="mt-4">
                  <Button variant="outline">Clear Search</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
