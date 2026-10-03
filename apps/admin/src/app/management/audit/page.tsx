import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldCheck, Key, Search, Clock, Activity, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const sParams = await searchParams
  const isUnlocked = sParams.key === 'ne@2007@sandy'

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] max-w-md mx-auto text-center space-y-6">
        <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner border border-indigo-100">
          <ShieldCheck className="h-10 w-10 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Audit Logs Secured</h1>
          <p className="text-zinc-500 text-sm">
            Viewing administrative audit logs requires the master security key.
          </p>
        </div>
        
        <Card className="w-full p-6 shadow-sm border-zinc-200">
          <form className="flex flex-col gap-4">
            <div className="flex items-center relative">
              <Key className="w-5 h-5 absolute left-3 text-zinc-400" />
              <input 
                type="password" 
                name="key" 
                placeholder="Enter Security Key..."
                className="w-full pl-10 pr-4 py-2 border border-zinc-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Unlock Logs
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  // Fetch Logs
  const { data: logs, error } = await supabase
    .from('admin_audit_logs')
    .select(`
      *,
      profiles:admin_id ( email, full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <Activity className="h-8 w-8 text-indigo-600" />
            Admin Audit Logs
          </h1>
          <p className="text-zinc-500 mt-1 text-sm md:text-base">
            Complete history of all administrative actions in Nestara Estates.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-y border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Timestamp</th>
                <th className="px-6 py-4 font-medium tracking-wider">Administrator</th>
                <th className="px-6 py-4 font-medium tracking-wider">Action Taken</th>
                <th className="px-6 py-4 font-medium tracking-wider">Target Property ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs && logs.length > 0 ? (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-zinc-900">
                        {log.profiles?.full_name || 'Unknown Admin'}
                      </div>
                      <div className="text-zinc-500 text-xs">
                        {log.profiles?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-zinc-500 flex items-center gap-2">
                      <Target className="h-4 w-4 text-zinc-400" />
                      {log.target_id || 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No audit logs found. Admin actions will appear here once performed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
