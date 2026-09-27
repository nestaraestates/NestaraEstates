import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShieldAlert, ShieldCheck, User, ShieldX, Key, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { promoteToAdmin, demoteFromAdmin } from '../actions'
import { isSuperAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'

export default async function ManageAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isSuper = isSuperAdmin(user?.email)

  if (!isSuper) {
    redirect('/management')
  }

  // If there's a search, show results. If not, show only admins.
  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  } else {
    query = query.eq('role', 'ADMIN')
  }

  const { data: profiles, error } = await query

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/management" className="text-zinc-500 hover:text-zinc-900 transition-colors">
              &larr; Back to Users
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mt-2">Manage Admins</h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">Grant or revoke administrative privileges for users. Requires security key.</p>
        </div>
        
        <form method="GET" action="/management/admins" className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              type="search" 
              name="q"
              placeholder="Search users to promote..." 
              className="pl-9 bg-white shadow-sm border-zinc-200 focus-visible:ring-zinc-900 rounded-lg"
              defaultValue={q}
            />
          </div>
          <Button type="submit" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg shadow-sm">Search</Button>
        </form>
      </div>
      
      <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white rounded-xl">
        <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{q ? 'Search Results' : 'Current Administrators'}</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {error ? (
            <div className="p-6 text-center text-red-500">Failed to load users: {error.message}</div>
          ) : profiles && profiles.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">User</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Current Role</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Access Control (Requires Key)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {profiles.map((profile) => {
                  const isAdmin = profile.role === 'ADMIN'
                  const initials = profile.full_name 
                    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : 'U'

                  return (
                    <tr key={profile.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-inner border
                            ${isAdmin ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900">{profile.full_name || 'Unknown User'}</div>
                            <div className="text-zinc-500 mt-0.5">{profile.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase
                          ${isAdmin ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60' : 'bg-zinc-100 text-zinc-700 border border-zinc-200/60'}`}>
                          {isAdmin ? <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> : <User className="h-3.5 w-3.5 mr-1.5" />}
                          {profile.role || 'User'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {!isAdmin ? (
                          <form action={async (formData: FormData) => {
                            'use server'
                            const pass = formData.get('security_key')
                            if (pass !== 'ne@2007@sandy') throw new Error('Invalid Security Key')
                            await promoteToAdmin(profile.id)
                          }} className="flex items-center justify-end gap-2">
                            <Input 
                              type="password" 
                              name="security_key" 
                              required 
                              placeholder="Security Key..." 
                              className="h-8 w-36 text-xs" 
                            />
                            <Button type="submit" size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                              <Key className="h-3.5 w-3.5 mr-1.5" /> Grant Admin
                            </Button>
                          </form>
                        ) : (
                          <form action={async (formData: FormData) => {
                            'use server'
                            const pass = formData.get('security_key')
                            if (pass !== 'ne@2007@sandy') throw new Error('Invalid Security Key')
                            await demoteFromAdmin(profile.id)
                          }} className="flex items-center justify-end gap-2">
                            <Input 
                              type="password" 
                              name="security_key" 
                              required 
                              placeholder="Security Key..." 
                              className="h-8 w-36 text-xs" 
                            />
                            <Button type="submit" variant="destructive" size="sm" className="h-8 shadow-sm">
                              <ShieldX className="h-3.5 w-3.5 mr-1.5" /> Revoke Admin
                            </Button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-zinc-500">
              No results found. Use the search to find a user to promote.
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
