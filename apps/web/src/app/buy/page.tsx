;
import { Suspense } from "react";
import { createClient } from '@/utils/supabase/server'
import { PropertyCard } from '@/components/properties/PropertyCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Filter } from 'lucide-react'

import { PropertyFilters } from '@/components/properties/PropertyFilters'
import { RealtimePropertiesListener } from '@/components/properties/RealtimePropertiesListener'

export const dynamic = 'force-dynamic'

export default async function BuyPropertiesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
  const minPrice = typeof resolvedParams.minPrice === 'string' ? resolvedParams.minPrice : ''
  const maxPrice = typeof resolvedParams.maxPrice === 'string' ? resolvedParams.maxPrice : ''
  const bhk = typeof resolvedParams.bhk === 'string' ? resolvedParams.bhk : ''

  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select(`
      id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose,
      property_media ( url, media_type )
    `)
    .eq('purpose', 'BUY')
    .eq('status', 'AVAILABLE')
    .neq('verification_status', 'REJECTED')
    .order('created_at', { ascending: false })

  if (search) {
    let orQuery = `title.ilike.%${search}%,city.ilike.%${search}%,location.ilike.%${search}%`
    
    // If the search term is 4 or more characters, also match by the first 3 characters 
    // to catch variations like "Hosa" matching "Hoskote"
    if (search.length >= 3) {
      const partial = search.substring(0, 3)
      orQuery += `,title.ilike.%${partial}%,city.ilike.%${partial}%,location.ilike.%${partial}%`
    }
    
    query = query.or(orQuery)
  }
  if (minPrice) {
    query = query.gte('price', parseInt(minPrice))
  }
  if (maxPrice) {
    query = query.lte('price', parseInt(maxPrice))
  }
  if (bhk) {
    if (bhk === '4') {
      query = query.gte('bhk', 4)
    } else {
      query = query.eq('bhk', parseInt(bhk))
    }
  }

  const { data: properties } = await query

  return (
    <div className="container mx-auto px-4 py-8">
      <RealtimePropertiesListener />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">Properties for Sale</h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Find your dream home from our verified listings.</p>
      </div>

      <Suspense fallback={<div className="h-20 animate-pulse bg-zinc-100 rounded-xl"></div>}><PropertyFilters /></Suspense>

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
            imageUrl={property.property_media?.find((m: any) => m.media_type === 'IMAGE')?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
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
