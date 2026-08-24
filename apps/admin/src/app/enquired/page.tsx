import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Target, Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EnquiredPropertiesPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, price, purpose, status, enquiries!inner(id)')
    .order('created_at', { ascending: false })

  // Deduplicate properties (since the inner join will return multiple rows if multiple enquiries)
  const uniquePropsMap = new Map()
  properties?.forEach(p => {
    if (!uniquePropsMap.has(p.id)) {
      uniquePropsMap.set(p.id, { ...p, leadCount: 1 })
    } else {
      uniquePropsMap.get(p.id).leadCount++
    }
  })
  
  const uniqueProps = Array.from(uniquePropsMap.values())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" /> Enquired Properties
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Properties that have active buyer interest.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
                <th className="px-4 py-3 font-semibold">Active Leads</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {uniqueProps.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-zinc-500">No properties with active leads found.</td></tr>
              ) : uniqueProps.map((prop: any) => (
                <tr key={prop.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-zinc-900">{prop.title}</td>
                  <td className="px-4 py-3 font-medium text-zinc-500">{prop.purpose}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                      {prop.leadCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/properties/${prop.id}?tab=buyers`} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-zinc-700 bg-white border border-zinc-200 rounded hover:bg-zinc-50">
                      <Eye className="h-3 w-3" /> View Leads
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
