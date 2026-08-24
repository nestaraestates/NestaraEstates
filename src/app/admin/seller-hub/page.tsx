import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Store, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SellerHubPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const purpose = (searchParams?.purpose as string) || 'BUY'
  const filter = (searchParams?.filter as string) || 'NEW'

  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('id, title, price, location, created_at, is_verified, verification_status, status, is_deleted, verification_checks, profiles(full_name)')
    .eq('purpose', purpose)
    .order('created_at', { ascending: false })

  if (filter === 'ALL') query = query.eq('is_deleted', false)
  if (filter === 'NEW') query = query.eq('verification_status', 'UNVERIFIED').eq('is_deleted', false).is('verification_checks->>admin_seen', null)
  if (filter === 'PENDING') query = query.eq('verification_status', 'UNVERIFIED').eq('is_deleted', false).eq('verification_checks->>admin_seen', 'true')
  if (filter === 'VERIFIED') query = query.eq('verification_status', 'VERIFIED').eq('is_deleted', false)
  if (filter === 'REJECTED') query = query.eq('verification_status', 'REJECTED').eq('is_deleted', false)
  if (filter === 'NEGOTIATING') query = query.eq('status', 'UNDER_NEGOTIATION').eq('is_deleted', false)
  if (filter === 'CLOSED') query = query.eq('status', 'CLOSED').eq('is_deleted', false)
  if (filter === 'DELETED') query = query.eq('is_deleted', true)

  const { data: properties } = await query

  const purposes = ['BUY', 'RENT', 'COMMERCIAL']
  const filters = ['ALL', 'NEW', 'PENDING', 'VERIFIED', 'REJECTED', 'NEGOTIATING', 'CLOSED', 'DELETED']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Store className="h-6 w-6 text-blue-600" /> Seller Hub
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Manage incoming seller properties and deal stages.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm p-1">
        <div className="flex gap-1 p-2 bg-zinc-50 border-b border-zinc-100">
          {purposes.map(p => (
            <Link key={p} href={`/admin/seller-hub?purpose=${p}&filter=${filter}`} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${purpose === p ? 'bg-white shadow-sm text-blue-600 ring-1 ring-zinc-200' : 'text-zinc-500 hover:text-zinc-900'}`}>
              {p}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide border-b border-zinc-100">
          {filters.map(f => (
            <Link key={f} href={`/admin/seller-hub?purpose=${purpose}&filter=${f}`} className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap ${filter === f ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'}`}>
              {f}
            </Link>
          ))}
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">Seller</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {properties?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No properties found.</td></tr>
              ) : properties?.map((prop: any) => (
                <tr key={prop.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">{prop.title}</div>
                    <div className="text-xs text-zinc-500 truncate max-w-[200px] sm:max-w-xs">{prop.location?.includes("|") ? prop.location.split("|")[1] : prop.location}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{prop.profiles?.full_name || 'Unknown'}</td>
                  <td className="px-4 py-3 font-medium">₹{prop.price?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    {prop.is_deleted ? <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">Deleted</span> :
                     prop.status === 'CLOSED' ? <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100">Closed</span> :
                     prop.status === 'UNDER_NEGOTIATION' ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Negotiating</span> :
                     prop.verification_status === 'VERIFIED' ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Verified</span> :
                     prop.verification_status === 'REJECTED' ? <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100">Rejected</span> :
                     prop.verification_checks?.admin_seen ? <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Pending</span> :
                     <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">New</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/properties/${prop.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded hover:bg-zinc-50">
                      <Eye className="h-3 w-3" /> Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
