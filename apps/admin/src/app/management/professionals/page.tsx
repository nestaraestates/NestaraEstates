import { createClient } from '@/utils/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, ShieldCheck, ShieldAlert, Star, Shield, SearchIcon, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { updateProfessionalVerificationLevel } from '../actions'

export const metadata = {
  title: 'Professionals Management | Admin',
  description: 'Manage professional accounts and verification levels',
}

export default async function ProfessionalsManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams?.q || ''

  // Fetch professional profiles with joined user info
  let query = supabase
    .from('professional_profiles')
    .select(`
      id,
      company_name,
      category,
      pricing,
      verification_level,
      profiles (
        email,
        full_name,
        custom_id
      )
    `)

  if (q) {
    query = query.ilike('company_name', `%${q}%`)
  }

  const { data: professionals, error } = await query

  const getVerificationBadge = (level: number) => {
    switch (level) {
      case 4:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Star className="h-3.5 w-3.5" /> Nestara Verified (Level 4)
          </span>
        )
      case 3:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Pro Verified (Level 3)
          </span>
        )
      case 2:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="h-3.5 w-3.5" /> Identity Verified (Level 2)
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200">
            <ShieldAlert className="h-3.5 w-3.5" /> Basic (Level 1)
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Professionals Management</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage professional accounts and verification levels.</p>
      </div>

      <Card className="overflow-hidden border-zinc-200 shadow-sm bg-white">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form className="relative w-full max-w-sm" action="/management/professionals" method="GET">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-zinc-400" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search companies..."
              className="block w-full pl-10 pr-3 py-2 border border-zinc-300 rounded-md leading-5 bg-white placeholder-zinc-500 focus:outline-none focus:placeholder-zinc-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-red-500">
              <ShieldAlert className="h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">Failed to load professionals</p>
              <p className="text-sm opacity-80">{error.message}</p>
            </div>
          ) : professionals && professionals.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-y border-zinc-100">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Professional</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Company & Category</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Pricing</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Verification Level</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {professionals.map((pro) => {
                  const profile = Array.isArray(pro.profiles) ? pro.profiles[0] : pro.profiles;
                  
                  // Generate Avatar Initials
                  const initials = profile?.full_name 
                    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                    : (pro.company_name ? pro.company_name.substring(0, 2).toUpperCase() : 'P')

                  return (
                    <tr key={pro.id} className="hover:bg-zinc-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-inner border bg-zinc-100 text-zinc-600 border-zinc-200">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-900">
                              {profile?.full_name || 'Unknown User'}
                            </div>
                            <div className="text-zinc-500 mt-0.5">{profile?.email}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-zinc-900">{pro.company_name || 'N/A'}</div>
                        <div className="text-zinc-500 mt-0.5 capitalize">{pro.category || 'N/A'}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-zinc-500">
                        {pro.pricing || 'N/A'}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getVerificationBadge(pro.verification_level || 1)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <form action={async () => { 'use server'; await updateProfessionalVerificationLevel(pro.id, 1); }}>
                            <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm" disabled={(pro.verification_level || 1) === 1}>
                              L1
                            </Button>
                          </form>
                          <form action={async () => { 'use server'; await updateProfessionalVerificationLevel(pro.id, 2); }}>
                            <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-blue-700 hover:bg-blue-50 hover:border-blue-200 shadow-sm" disabled={pro.verification_level === 2}>
                              L2
                            </Button>
                          </form>
                          <form action={async () => { 'use server'; await updateProfessionalVerificationLevel(pro.id, 3); }}>
                            <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm" disabled={pro.verification_level === 3}>
                              L3
                            </Button>
                          </form>
                          <form action={async () => { 'use server'; await updateProfessionalVerificationLevel(pro.id, 4); }}>
                            <Button type="submit" variant="outline" size="sm" className="h-8 bg-white border-zinc-200 text-purple-700 hover:bg-purple-50 hover:border-purple-200 shadow-sm" disabled={pro.verification_level === 4}>
                              L4
                            </Button>
                          </form>
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
              <h3 className="text-lg font-medium text-zinc-900 mb-1">No professionals found</h3>
              <p className="text-zinc-500 max-w-sm">
                {q ? `We couldn't find any professionals matching "${q}".` : 'There are no professional accounts yet.'}
              </p>
              {q && (
                <Link href="/management/professionals" className="mt-4">
                  <Button variant="outline">Clear Filters</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
