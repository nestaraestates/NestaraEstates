;
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Search, Building2, TrendingUp, Sparkles } from 'lucide-react'
import { HomeSearch } from '@/components/properties/HomeSearch'
import { createClient } from '@/utils/supabase/server'
import { PropertyCard } from '@/components/properties/PropertyCard'

export const revalidate = 60

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all available, verified properties
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      id, title, price, location, city, bhk, bathrooms, area_sqft, is_verified, purpose, status, verification_status,
      property_media ( url, media_type )
    `)
    .eq('status', 'AVAILABLE')
    .eq('verification_status', 'VERIFIED')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 bg-zinc-50/50">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-zinc-950/70" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center mt-10">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Find a Property <br className="hidden sm:block" />
            <span className="text-amber-500">You Can Trust.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Discover, compare, verify and connect with premium properties through Nestara Estates.
          </p>

          <HomeSearch />
          
          <div className="mt-8 flex justify-center gap-4 text-sm text-zinc-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-amber-500" /> Verified Listings</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-amber-500" /> Best Market Prices</span>
          </div>
        </div>
      </section>

      {/* Main Properties Display */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-amber-500" /> Featured Properties
            </h2>
            <p className="text-zinc-500 mt-2">Explore our latest verified listings for sale and rent.</p>
          </div>
          <Link href="/buy">
            <Button variant="outline" className="border-zinc-300 text-zinc-700 font-bold hover:bg-zinc-100">
              View Map Search
            </Button>
          </Link>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {properties.map((property: any) => {
              const imageMedia = property.property_media?.find((m: any) => m.media_type === 'IMAGE')
              
              return (
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
                  imageUrl={imageMedia?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800'}
                  isVerified={property.verification_status === 'VERIFIED'}
                  purpose={property.purpose}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-3xl">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">No verified properties yet</h3>
            <p className="text-zinc-500">Check back soon for new listings.</p>
          </div>
        )}
      </section>

      {/* Why Nestara Section (Only shown to logged OUT users) */}
      {!user && (
        <section className="bg-white py-24 border-t border-zinc-100">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">Why Choose Nestara Estates</h2>
              <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">The modern approach to real estate transactions.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Trust', desc: 'Transparent and reliable information for every property.', icon: ShieldCheck },
                { title: 'Verification', desc: 'Structured legal and identity verification services.', icon: Building2 },
                { title: 'Technology', desc: 'Making discovery and decisions easier than ever.', icon: Search },
                { title: 'Convenience', desc: 'Everything you need in one centralized platform.', icon: TrendingUp },
              ].map((feature) => (
                <div key={feature.title} className="flex flex-col items-center rounded-2xl bg-zinc-50 p-8 text-center border border-zinc-100">
                  <div className="mb-4 rounded-full bg-amber-100 p-4 text-amber-600">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-zinc-900">{feature.title}</h3>
                  <p className="text-zinc-600 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
