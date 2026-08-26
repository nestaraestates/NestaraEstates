import { createClient } from '@/utils/supabase/server'
import { Users, Building, ShieldCheck, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: propsCount },
    { count: verifiedCount },
    { count: unverifiedCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_verified', false)
  ])

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">System Status</h1>
        <p className="text-zinc-500 text-sm mt-1 font-medium">Overview of the Nestara OS metrics.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 mb-1">{usersCount || 0}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Total Users</div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center">
              <Building className="h-5 w-5 text-zinc-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 mb-1">{propsCount || 0}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Total Properties</div>
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 mb-1">{verifiedCount || 0}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Verified Properties</div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-900 mb-1">{unverifiedCount || 0}</div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Unverified Properties</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-8 text-center mt-8">
        <h2 className="text-lg font-bold text-zinc-900 mb-2">Welcome to Nestara OS</h2>
        <p className="text-zinc-500 font-medium text-sm max-w-md mx-auto">
          Navigate using the sidebar to manage sellers, buyers, properties, and messages.
        </p>
      </div>
    </div>
  )
}
