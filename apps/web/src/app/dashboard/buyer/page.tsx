;
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { BuyerDirectChat } from '@/components/buyer/BuyerDirectChat'

export const dynamic = 'force-dynamic'

export default async function BuyerDashboard({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const resolvedParams = await searchParams;
  const tab = resolvedParams.tab || 'enquiries'

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

  // Fetch saved properties
  const { data: savedProps } = await supabase
    .from('saved_properties')
    .select(`
      id,
      property_id,
      properties (
        id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, status,
        property_media ( url, media_type )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
          {tab === 'saved' ? 'Saved Properties' : 'My Enquiries'}
        </h1>
      </div>

      {tab === 'enquiries' && (
        <Card>
          <CardHeader>
            <CardTitle>Properties I've Enquired About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enquiries?.map((enquiry: any) => (
                <div key={enquiry.id} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col justify-between gap-4">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
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
                  <div className="w-full flex justify-end pt-2 border-t border-zinc-100">
                    <BuyerDirectChat initialEnquiryId={enquiry.id} propertyId={enquiry.properties.id} buyerId={user.id} />
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
      )}

      {tab === 'saved' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {savedProps?.map((saved: any) => {
            const property = saved.properties
            if (!property) return null
            return (
              <PropertyCard
                key={saved.id}
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
                isFavorited={true}
              />
            )
          })}
          
          {(!savedProps || savedProps.length === 0) && (
            <Card className="col-span-full border-dashed border-2 py-12 text-center bg-transparent">
              <CardContent>
                <p className="text-zinc-500 mb-4">You haven't saved any properties yet.</p>
                <Link href="/buy">
                  <Button variant="outline">Browse Properties</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
