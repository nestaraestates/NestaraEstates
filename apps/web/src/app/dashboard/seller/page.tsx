export const runtime = "edge";
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SellerDirectChat } from '@/components/seller/SellerDirectChat'

export const dynamic = 'force-dynamic'

export default async function SellerDashboard({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab || 'listings'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in.</div>
  }

  // Fetch properties owned by this user
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, status,
      property_media ( url, media_type )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch enquiries for properties owned by this user
  const { data: enquiries } = await supabase
    .from('enquiries')
    .select('*, properties!inner(title)')
    .eq('properties.owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
          {tab === 'inbox' ? 'Seller Inbox' : 'My Listings'}
        </h1>
        <Link href="/list-property">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold">Add New Property</Button>
        </Link>
      </div>

      {tab === 'listings' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties?.map((property) => (
            <div key={property.id} className="relative">
              {/* Status Badge Overlays */}
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                <span className={`px-2 py-1 text-xs font-bold rounded text-white ${property.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {property.status}
                </span>
              </div>
              
              <PropertyCard
                id={property.id}
                title={property.title}
                price={property.price}
                location={property.location}
                city={property.city}
                bhk={property.bhk || 0}
                bathrooms={property.bathrooms || 0}
                area={property.area_sqft || 0}
                imageUrl={property.property_media?.find((m: any) => m.media_type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
                isVerified={property.is_verified}
                purpose={property.purpose}
              />
              <div className="mt-3 flex flex-wrap gap-2 justify-center items-center">
                <SellerDirectChat propertyId={property.id} sellerId={user.id} />
                
              </div>
            </div>
          ))}

          {(!properties || properties.length === 0) && (
            <Card className="col-span-full border-dashed border-2 py-12 text-center bg-transparent">
              <CardContent>
                <p className="text-zinc-500 mb-4">You haven't listed any properties yet.</p>
                <Link href="/list-property">
                  <Button variant="outline">List a Property Now</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'inbox' && (
        <div className="space-y-4">
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <h3 className="font-bold text-amber-800 dark:text-amber-500 mb-2">Nestara Negotiation Shield Active</h3>
            <p className="text-sm text-amber-700 dark:text-amber-600">
              We protect your privacy. Nestara Agents handle all direct communication, filtering out spam and lowball offers so you only see serious buyers.
            </p>
          </div>
          {(!enquiries || enquiries.length === 0) ? (
            <Card className="border-dashed border-2 py-12 text-center bg-transparent">
              <CardContent>
                <p className="text-zinc-500">No active leads at the moment.</p>
              </CardContent>
            </Card>
          ) : (
            enquiries.map((enq) => (
              <Card key={enq.id} className="border-zinc-200 dark:border-zinc-800">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Buyer Lead #{enq.id.substring(0, 6).toUpperCase()}</CardTitle>
                      <p className="text-sm text-zinc-500 mt-1">
                        Interested in: <Link href={`/property/${enq.property_id}`} className="text-amber-600 hover:underline font-medium">{enq.properties?.title}</Link>
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold text-xs rounded-full uppercase">
                      {enq.status || 'Nestara Agent Reviewing'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      A Nestara professional is currently managing this lead. We will call you directly when an official offer is ready to review.
                    </p>
                    <p className="text-xs text-zinc-400 mt-2 mb-4 sm:mb-0">
                      Received: {new Date(enq.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="w-full sm:w-auto flex justify-end shrink-0">
                    <SellerDirectChat propertyId={enq.properties?.id} sellerId={user.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
