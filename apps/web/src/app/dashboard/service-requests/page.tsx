import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { HardHat, MapPin, Calendar, IndianRupee, FileText } from 'lucide-react'
import { DeleteRequestButton } from './DeleteRequestButton'

export const dynamic = 'force-dynamic'

export default async function ServiceRequestsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in.</div>
  }

  const { data: requests } = await supabase
    .from('service_requests')
    .select('*')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          My Service Requests
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Home Building & Professional Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requests?.map((req: any) => (
              <div key={req.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex flex-col gap-4 bg-white hover:bg-zinc-50 transition-colors shadow-sm">
                
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <HardHat className="w-5 h-5 text-brand-600" />
                      <h3 className="font-bold text-lg text-zinc-900">{req.service_category}</h3>
                    </div>
                    <span className="self-start px-2.5 py-0.5 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider">
                      Status: {req.status}
                    </span>
                  </div>
                  <DeleteRequestButton id={req.id} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-zinc-600 mt-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span>{req.location_data?.city || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-zinc-400" />
                    <span>Budget Approx: ₹{req.budget_approx}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span>Starts: {req.location_data?.start_date || 'N/A'}</span>
                  </div>
                </div>

                <div className="mt-2 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                  <div className="flex items-center gap-2 mb-1 text-zinc-700 font-medium">
                    <FileText className="w-4 h-4" /> Details
                  </div>
                  <p className="text-sm text-zinc-600">
                    {req.details}
                  </p>
                </div>

              </div>
            ))}

            {(!requests || requests.length === 0) && (
              <div className="py-12 text-center flex flex-col items-center">
                <HardHat className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-bold text-zinc-900 mb-2">No Requests Yet</h3>
                <p className="text-zinc-500 mb-6 max-w-sm">You haven't submitted any home building or professional service requests.</p>
                <Link href="/build-your-home" className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors">
                  Start a Project
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
