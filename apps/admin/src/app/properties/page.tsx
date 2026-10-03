import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin'
import { Building, MapPin, Search, Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { formatIndianCurrencyShort } from '@/lib/formatPrice'
import { AdvancedSearchControls } from '@/components/AdvancedSearchControls'


const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

export const dynamic = 'force-dynamic'

export default async function AdminPropertiesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profileRes = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const profile = profileRes.data

  if (!isSuperAdmin(user.email) && (profile?.role !== 'admin' && profile?.role !== 'ADMIN')) {
    redirect('/')
  }

  const sp = await searchParams || {}
  const q = sp.q
  const status = sp.status

  let propertiesQuery = supabase
    .from('properties')
    .select(`
      id, title, price, location, city, status, is_verified, created_at, is_deleted,
      profiles ( full_name, email )
    `)
    .order('created_at', { ascending: false })

  if (q) {
    if (isUUID(q)) {
      propertiesQuery = propertiesQuery.or(`id.eq.${q},owner_id.eq.${q}`)
    } else if (q.includes('@')) {
      // If it looks like an email, find matching profile IDs first
      const { data: matchedProfiles } = await supabase.from('profiles').select('id').ilike('email', `%${q}%`)
      if (matchedProfiles && matchedProfiles.length > 0) {
        const ids = matchedProfiles.map(p => p.id).join(',')
        propertiesQuery = propertiesQuery.filter('owner_id', 'in', `(${ids})`)
      } else {
        // If no email matches, force empty result
        propertiesQuery = propertiesQuery.eq('id', '00000000-0000-0000-0000-000000000000')
      }
    } else if (/^[0-9a-fA-F]{4,12}$/.test(q)) {
      // Looks like a short UUID piece!
      const { data: allProps } = await supabase.from('properties').select('id, owner_id')
      const matchedIds = allProps?.filter(p => p.id.toLowerCase().includes(q.toLowerCase()) || p.owner_id.toLowerCase().includes(q.toLowerCase())).map(p => p.id) || []
      
      if (matchedIds.length > 0) {
        propertiesQuery = propertiesQuery.filter('id', 'in', `(${matchedIds.join(',')})`)
      } else {
        propertiesQuery = propertiesQuery.or(`title.ilike.%${q}%,location.ilike.%${q}%,city.ilike.%${q}%`)
      }
    } else {
      propertiesQuery = propertiesQuery.or(`title.ilike.%${q}%,location.ilike.%${q}%,city.ilike.%${q}%`)
    }
  }
  if (status) {
    propertiesQuery = propertiesQuery.eq('status', status)
  }

  const { data: properties, error } = await propertiesQuery

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">All Properties</h1>
          <p className="text-zinc-500 font-medium text-sm mt-1">Manage all listings across the platform.</p>
        </div>
        
        <AdvancedSearchControls 
          placeholder="Search properties..." 
          filters={[
            { key: 'status', label: 'All Statuses', options: [
              { label: 'Available', value: 'AVAILABLE' },
              { label: 'Sold', value: 'SOLD' },
              { label: 'Deleted', value: 'DELETED' }
            ]}
          ]} 
        />
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Property</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Deleted</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {properties?.map(prop => (
                <tr key={prop.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/properties/${prop.id}`} className="font-bold text-zinc-900 hover:text-blue-600 truncate block max-w-[200px]">
                      {prop.title}
                    </Link>
                    <div className="text-[10px] text-zinc-400 font-medium mt-1">
                      {new Date(prop.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                      {prop.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-zinc-900">
                    {formatIndianCurrencyShort(prop.price)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-zinc-700">{(prop.profiles as any)?.full_name || 'Unknown'}</div>
                    <div className="text-[10px] text-zinc-500">{(prop.profiles as any)?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                      prop.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      prop.status === 'SOLD' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      prop.status === 'DELETED' ? 'bg-red-50 text-red-700 border border-red-200' :
                      'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}>
                      {prop.status || 'AVAILABLE'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {prop.is_deleted ? (
                      <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs"><XCircle className="h-3.5 w-3.5" /> Yes</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/edit-property/${prop.id}`}>
                        <button className="h-8 w-8 rounded bg-zinc-50 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 border border-zinc-200 flex items-center justify-center transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <form action={async () => {
                        'use server'
                        const { hardDeleteProperty } = await import('@/app/actions')
                        await hardDeleteProperty(prop.id)
                      }}>
                        <button type="submit" className="h-8 w-8 rounded bg-zinc-50 text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-zinc-200 flex items-center justify-center transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {(!properties || properties.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">
                    No properties found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
