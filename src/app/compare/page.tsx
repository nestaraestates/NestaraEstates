import { createClient } from '@/utils/supabase/server'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const resolvedParams = await searchParams;
  const ids = resolvedParams.ids ? resolvedParams.ids.split(',') : []
  
  if (ids.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Compare Properties</h1>
        <p className="text-zinc-500 mb-8">You haven't selected any properties to compare yet.</p>
        <Link href="/buy">
          <Button className="bg-amber-500 hover:bg-amber-600 text-white">Browse Properties</Button>
        </Link>
      </div>
    )
  }

  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, type, description,
      property_media ( url )
    `)
    .in('id', ids)

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(val)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Comparison Matrix</h1>
      
      <div className="overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-max">
          {properties?.map((property) => (
            <div key={property.id} className="w-[350px] flex-shrink-0 space-y-4">
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
              
              <Card>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 font-medium">Type</div>
                    <div className="p-3">{property.type}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 font-medium">Price</div>
                    <div className="p-3 font-bold text-amber-600">{formatCurrency(property.price)}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 font-medium">Area</div>
                    <div className="p-3">{property.area_sqft} sqft</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 font-medium">Bedrooms</div>
                    <div className="p-3">{property.bhk}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm border-b border-zinc-100 dark:border-zinc-800">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 font-medium">Bathrooms</div>
                    <div className="p-3">{property.bathrooms}</div>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 font-medium">Verification</div>
                    <div className="p-3">
                      {property.is_verified ? (
                        <span className="text-emerald-600 font-bold">Verified</span>
                      ) : (
                        <span className="text-zinc-500">Unverified</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
