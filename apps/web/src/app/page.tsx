import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Search, Building2, TrendingUp, Sparkles, MapPin } from 'lucide-react'
import { HomeSearch } from '@/components/properties/HomeSearch'
import { createStaticClient } from '@/utils/supabase/static'
import { PropertyCard } from '@/components/properties/PropertyCard'

export const revalidate = 60

export default async function Home() {
  const supabase = createStaticClient()
  
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
    <div className="flex-1 bg-surface-50">
      {/* Hero Section */}
      <section className="relative flex min-h-[65vh] items-center justify-center overflow-hidden bg-surface-900">
        {/* Modern Clean Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=2070")' }}
        >
          <div className="absolute inset-0 bg-surface-950/70 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-800/80 px-4 py-2 text-sm font-medium text-brand-400 mb-8 border border-surface-700 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            <span>Discover Premium Real Estate</span>
          </div>
          
          <h1 className="mb-6 text-4xl font-black tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Find a Property <br className="hidden sm:block" />
            <span className="text-brand-500">You Can Trust.</span>
          </h1>
          
          <p className="mx-auto mb-12 max-w-2xl text-lg text-surface-300 sm:text-xl font-medium leading-relaxed">
            Discover, compare, verify and connect with premium properties through Nestara Estates.
          </p>

          <div className="max-w-4xl mx-auto bg-white/5 p-3 sm:p-4 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
            <HomeSearch />
          </div>
          
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-sm font-semibold text-surface-300">
            <span className="flex items-center gap-2">
              <div className="rounded-full bg-brand-500/20 p-1.5"><ShieldCheck className="h-5 w-5 text-brand-400" /></div>
              Verified Listings
            </span>
            <span className="flex items-center gap-2">
              <div className="rounded-full bg-brand-500/20 p-1.5"><MapPin className="h-5 w-5 text-brand-400" /></div>
              Prime Locations
            </span>
            <span className="flex items-center gap-2">
              <div className="rounded-full bg-brand-500/20 p-1.5"><Building2 className="h-5 w-5 text-brand-400" /></div>
              Premium Quality
            </span>
          </div>
        </div>
      </section>

      {/* Main Properties Display */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-28">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black tracking-tight text-surface-900 sm:text-2xl md:text-2xl dark:text-white flex items-center gap-3">
              Featured Properties
            </h2>
            <p className="text-surface-500 dark:text-surface-400 mt-4 text-lg">
              Explore our hand-picked selection of verified premium listings for sale and rent.
            </p>
          </div>
          <Link href="/buy" className="shrink-0">
            <Button variant="outline" size="lg" className="border-surface-300 text-surface-700 font-bold hover:bg-surface-100 hover:text-surface-900 rounded-xl h-12 px-6 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800">
              View Map Search
            </Button>
          </Link>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="flex flex-col items-center justify-center text-center py-12 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl shadow-sm">
            <div className="rounded-full bg-surface-100 p-4 mb-6 dark:bg-surface-800">
              <Search className="h-10 w-10 text-surface-400" />
            </div>
            <h3 className="text-2xl font-black text-surface-900 dark:text-white mb-3">No verified properties yet</h3>
            <p className="text-surface-500 dark:text-surface-400 text-lg max-w-md">Check back soon for new exclusive listings added to our platform.</p>
          </div>
        )}
      </section>

      {/* Why Nestara Section */}
      <section className="bg-white dark:bg-surface-950 py-12 lg:py-12 border-t border-surface-100 dark:border-surface-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-black tracking-tight text-surface-900 sm:text-2xl md:text-2xl dark:text-white">
              Why Choose Nestara
            </h2>
            <p className="mt-6 text-lg text-surface-600 dark:text-surface-400">
              The modern, transparent, and secure approach to real estate transactions.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Trust', desc: 'Transparent and reliable information for every property.', icon: ShieldCheck },
              { title: 'Verification', desc: 'Structured legal and identity verification services.', icon: Building2 },
              { title: 'Technology', desc: 'Making discovery and decisions easier than ever.', icon: Search },
              { title: 'Convenience', desc: 'Everything you need in one centralized platform.', icon: TrendingUp },
            ].map((feature) => (
              <div key={feature.title} className="group flex flex-col items-center rounded-xl bg-surface-50 dark:bg-surface-900 p-4 text-center border border-surface-100 dark:border-surface-800 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="mb-6 rounded-xl bg-brand-100 dark:bg-brand-900/30 p-5 text-brand-600 dark:text-brand-500 transition-transform group-hover:scale-110">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-surface-900 dark:text-white">{feature.title}</h3>
                <p className="text-surface-600 dark:text-surface-400 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotion Section for Owners */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-brand-600 dark:bg-brand-700 rounded-[2.5rem] p-4 sm:p-12 md:p-16 flex flex-col items-center text-center shadow-2xl">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-800 rounded-full blur-3xl opacity-50 translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col items-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-500/30 border border-brand-400/30 text-white font-bold text-sm tracking-wide mb-6">
                FOR OWNERS & DEALERS
              </span>
              <h3 className="text-2xl md:text-2xl font-black text-white mb-6 tracking-tight">
                List Your Property Today
              </h3>
              <p className="text-brand-100 text-lg md:text-xl mb-10 leading-relaxed max-w-2xl font-medium">
                Our specialized Nestara Agents handle tedious negotiations and verifications for you, filtering out spam to connect you only with serious, verified buyers.
              </p>
              <Link href="/list-property">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-surface-50 font-black px-10 h-14 text-lg rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                  Start Listing For Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
