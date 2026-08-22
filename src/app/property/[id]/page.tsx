import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { submitEnquiry } from './actions'
import { EmiCalculator } from '@/components/calculators/EmiCalculator'
import { RentVsBuyCalculator } from '@/components/calculators/RentVsBuyCalculator'
import { RoiCalculator } from '@/components/calculators/RoiCalculator'
import { PropertyMap } from '@/components/properties/PropertyMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldCheck, MapPin, BedDouble, Bath, Square, Calendar, Share2, Heart, CheckCircle2 } from 'lucide-react'

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles ( full_name, phone_number, email ),
      property_media ( url, media_type, is_featured )
    `)
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 3,
  }).format(property.price)

  const defaultImage = property.property_media?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2075'

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded bg-zinc-900 px-3 py-1 text-xs font-bold text-white tracking-wider">
              FOR {property.purpose}
            </span>
            {property.is_verified && (
              <span className="flex items-center gap-1 rounded bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> NESTARA VERIFIED
              </span>
            )}
            <span className="rounded bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              {property.type}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-2">{property.title}</h1>
          <div className="flex items-center text-zinc-500 dark:text-zinc-400">
            <MapPin className="mr-1.5 h-4 w-4" />
            {property.location}, {property.city}
          </div>
        </div>
        
        <div className="text-left md:text-right">
          <div className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-2">
            {formattedPrice} {property.purpose === 'RENT' && <span className="text-xl font-normal text-zinc-500">/mo</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
            <Button variant="outline" size="sm"><Heart className="h-4 w-4 mr-2" /> Save</Button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
        <div className="md:col-span-3 rounded-2xl overflow-hidden relative group cursor-pointer">
          <img src={defaultImage} alt="Main property view" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
        <div className="hidden md:flex flex-col gap-4">
          <div className="h-1/2 rounded-2xl overflow-hidden relative group cursor-pointer">
             <img src="https://images.unsplash.com/photo-1600607687931-ce8e0026de78?auto=format&fit=crop&q=80&w=800" alt="Interior view" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          <div className="h-1/2 rounded-2xl overflow-hidden relative group cursor-pointer">
             <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">+5 Photos</span>
             </div>
             <img src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800" alt="Room view" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          
          <div className="flex flex-wrap gap-6 py-6 border-y border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-amber-600"><BedDouble className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-zinc-500">Bedrooms</p>
                <p className="font-semibold">{property.bhk} BHK</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-amber-600"><Bath className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-zinc-500">Bathrooms</p>
                <p className="font-semibold">{property.bathrooms}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-amber-600"><Square className="h-6 w-6" /></div>
              <div>
                <p className="text-sm text-zinc-500">Super Area</p>
                <p className="font-semibold">{property.area_sqft} sq.ft</p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {property.description || "A premium property located in the heart of the city offering luxury, comfort, and security. Features modern architecture, spacious rooms, and excellent connectivity. Perfect for families looking for a verified, hassle-free living experience."}
            </p>
          </section>

          {property.is_verified && (
            <section className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center">
                <ShieldCheck className="mr-2 h-6 w-6" /> Verification Checks Passed
              </h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-emerald-700 dark:text-emerald-500/80">
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Title Document Validated</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Identity Verification Completed</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No Known Encumbrances</p>
                <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Tax Receipts Verified</p>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-6">Financial Tools</h2>
            {property.purpose === 'BUY' && (
              <div className="space-y-6">
                <EmiCalculator defaultPrice={property.price} />
                <RentVsBuyCalculator defaultPrice={property.price} />
              </div>
            )}
            {property.purpose === 'RENT' && (
              <RoiCalculator defaultPrice={property.price * 250} /> /* Estimation for demo */
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Location Map</h2>
            <PropertyMap location={`${property.location}, ${property.city}`} />
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">Contact Owner/Dealer</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-lg">
                {property.profiles?.full_name?.[0] || 'O'}
              </div>
              <div>
                <p className="font-semibold text-lg">{property.profiles?.full_name || 'Verified Owner'}</p>
                <p className="text-sm text-zinc-500">Responds typically within 1 hour</p>
              </div>
            </div>

            <form action={submitEnquiry} className="space-y-4 mb-6">
              <input type="hidden" name="property_id" value={property.id} />
              <Input name="name" placeholder="Your Name" required />
              <Input name="email" type="email" placeholder="Your Email" required />
              <Input name="phone" placeholder="Your Phone Number" required />
              <textarea name="message" className="w-full flex min-h-[80px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" placeholder="I am interested in this property..." required></textarea>
              <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-12">
                Send Enquiry
              </Button>
            </form>

            <p className="text-xs text-center text-zinc-500">
              By enquiring, you agree to Nestara Estates Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
