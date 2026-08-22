import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SellerDashboard() {
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
      property_media ( url )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link href="/list-property">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">Add New Property</Button>
        </Link>
      </div>

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
              imageUrl={property.property_media?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
              isVerified={property.is_verified}
              purpose={property.purpose}
            />
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
    </div>
  )
}
