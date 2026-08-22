import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ShieldCheck, MapPin, Building2, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-zinc-950/70" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Find a Property <br className="hidden sm:block" />
            <span className="text-amber-500">You Can Trust.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-300 sm:text-xl">
            Discover, compare, verify and connect with premium properties through Nestara Estates.
          </p>

          {/* Search Bar Container */}
          <div className="mx-auto max-w-4xl rounded-2xl bg-white/10 p-2 backdrop-blur-md">
            <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-2xl sm:flex-row dark:bg-zinc-950">
              
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <Input 
                  type="text" 
                  placeholder="Location, Landmark, or Project" 
                  className="border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                />
              </div>

              <div className="hidden h-10 w-px bg-zinc-200 sm:block dark:bg-zinc-800" />

              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <Building2 className="h-5 w-5 text-zinc-400" />
                <Input 
                  type="text" 
                  placeholder="Property Type (e.g. Villa, Appt)" 
                  className="border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
                />
              </div>

              <Button size="lg" className="h-12 w-full bg-amber-500 text-white hover:bg-amber-600 sm:w-auto px-8">
                <Search className="mr-2 h-4 w-4" />
                Search Properties
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-4 text-sm text-zinc-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-amber-500" /> Verified Listings</span>
            <span className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-amber-500" /> Best Market Prices</span>
          </div>
        </div>
      </section>

      {/* Why Nestara Section */}
      <section className="bg-white py-24 dark:bg-zinc-950">
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
              <div key={feature.title} className="flex flex-col items-center rounded-2xl bg-zinc-50 p-8 text-center dark:bg-zinc-900/50">
                <div className="mb-4 rounded-full bg-amber-100 p-4 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
