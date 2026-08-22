import { createClient } from '@/utils/supabase/server'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BuyPropertiesPage() {
  const supabase = await createClient()

  // Fetch properties for sale
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose,
      property_media ( url )
    `)
    .eq('purpose', 'BUY')
    .eq('status', 'AVAILABLE')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">Properties for Sale</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Find your dream home from our verified listings.</p>
      </div>

      {/* Mobile-first Search and Filter Bar */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input placeholder="Search by location or project..." className="pl-9 h-11" />
        </div>
        <div className="flex gap-2">
          <select className="h-11 flex-1 rounded-md border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-950 sm:flex-none sm:w-32">
            <option>All Types</option>
            <option>Villa</option>
            <option>Apartment</option>
          </select>
          <Button variant="outline" className="h-11 w-11 p-0 sm:w-auto sm:px-4">
            <Filter className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3/4 cols */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {properties?.map((property) => (
          <PropertyCard
            key={property.id}
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
        ))}

        {(!properties || properties.length === 0) && (
          <div className="col-span-full py-12 text-center text-zinc-500">
            No properties found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
