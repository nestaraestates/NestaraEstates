import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Users, Eye, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BuyerHubPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase
    .from('enquiries')
    .select(`
      id, name, email, phone, status, created_at, property_id,
      properties(title, purpose)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" /> Buyer Hub
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Manage all buyer enquiries and leads across all properties.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">All Active Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Lead Contact</th>
                <th className="px-4 py-3 font-semibold">Property Interest</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No leads found.</td></tr>
              ) : leads?.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-zinc-900">{lead.name}</div>
                    <div className="text-xs text-zinc-500">{lead.phone || lead.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-900 truncate max-w-[200px]">{lead.properties?.title || 'Unknown Property'}</div>
                    <div className="text-[10px] font-bold text-blue-600 tracking-wider">{lead.properties?.purpose}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs font-medium">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {lead.status === 'NEW' ? <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-1 rounded">New</span> :
                     lead.status === 'CONTACTED' ? <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-1 rounded">Contacted</span> :
                     <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Closed</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/properties/${lead.property_id}?tab=buyers&lead=${lead.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded hover:bg-zinc-50">
                      <Eye className="h-3 w-3" /> Manage Lead
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
