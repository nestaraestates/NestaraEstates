import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BuyerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in.</div>
  }

  // Fetch enquiries made by this user
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select(`
      id, message, status, created_at,
      properties ( id, title, location, city, price )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Enquiries & Saves</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties I've Enquired About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enquiries?.map((enquiry: any) => (
              <div key={enquiry.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <Link href={`/property/${enquiry.properties.id}`} className="font-bold text-lg hover:underline text-amber-600">
                    {enquiry.properties.title}
                  </Link>
                  <p className="text-sm text-zinc-500">{enquiry.properties.location}, {enquiry.properties.city}</p>
                  <p className="text-sm mt-2 italic text-zinc-600 dark:text-zinc-400">"{enquiry.message}"</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 rounded text-xs font-bold uppercase tracking-wider">
                    {enquiry.status}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(enquiry.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}

            {(!enquiries || enquiries.length === 0) && (
              <div className="py-8 text-center text-zinc-500">
                You haven't made any property enquiries yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
