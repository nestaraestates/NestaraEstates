;
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { deleteProperty } from './actions'
import { EmiCalculator } from '@/components/calculators/EmiCalculator'
import { RentVsBuyCalculator } from '@/components/calculators/RentVsBuyCalculator'
import { RoiCalculator } from '@/components/calculators/RoiCalculator'
import { PropertyMap } from '@/components/properties/PropertyMap'
import { PropertyGallery } from '@/components/properties/PropertyGallery'
import { Button } from '@/components/ui/button'
import { ShieldCheck, MapPin, BedDouble, Bath, Square, CalendarDays, Share2, Heart, Edit, CheckCircle2, XCircle } from 'lucide-react'
import { FavoriteButton } from '@/components/properties/FavoriteButton'
import { ShareButton } from '@/components/properties/ShareButton'
import Link from 'next/link'
import { BuyerInteractionTabs } from '@/components/buyer/BuyerInteractionTabs'

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient()
  const [userRes, propertyRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from('properties')
      .select(`
        *,
        profiles ( full_name, phone_number, email ),
        property_media ( url, media_type, is_featured )
      `)
      .eq('id', id)
      .single()
  ])

  const { data: { user } } = userRes
  const { data: property, error } = propertyRes

  if (error || !property) {
    notFound()
  }

  let isFavorited = false
  let userProfile = null
  let existingEnquiryId = null

  if (user) {
    const [savedPropRes, profileRes, enqRes] = await Promise.all([
      supabase.from('saved_properties').select('id').eq('user_id', user.id).eq('property_id', id).single(),
      supabase.from('profiles').select('full_name, email, phone_number, address').eq('id', user.id).single(),
      supabase.from('enquiries').select('id').eq('property_id', id).eq('user_id', user.id).single()
    ])

    if (savedPropRes.data) isFavorited = true
    userProfile = profileRes.data
    if (enqRes.data) existingEnquiryId = enqRes.data.id
  }

  const isOwner = user?.id === property.owner_id

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 3,
  }).format(property.price)

  const publicImages = property.property_media?.filter((m: any) => m.media_type === 'IMAGE') || []
  const defaultImage = publicImages[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2075'

  const displayLocation = property.location.includes('|') 
    ? property.location.split('|')[1].trim() 
    : property.location.trim()

  const cleanCity = property.city.trim()
  const finalLocationText = displayLocation.toLowerCase() === cleanCity.toLowerCase() 
    ? displayLocation 
    : `${displayLocation}, ${cleanCity}`

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-900/30 px-2 py-1 text-xs font-bold text-amber-700 dark:text-amber-500 ring-1 ring-inset ring-amber-600/20">
              FOR {property.purpose}
            </span>
            <span className="inline-flex items-center rounded-md bg-zinc-50 dark:bg-zinc-900 px-2 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-400 ring-1 ring-inset ring-zinc-500/20">
              {property.type}
            </span>
            {property.is_verified && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20">
                <ShieldCheck className="h-3 w-3" /> VERIFIED
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            {property.title}
          </h1>
          <div className="flex items-center text-zinc-600 dark:text-zinc-400">
            <MapPin className="h-4 w-4 mr-1" />
            {finalLocationText}
          </div>
        </div>
        
        <div className="text-left md:text-right">
          <div className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-2">
            {formattedPrice} {property.purpose === 'RENT' && <span className="text-xl font-normal text-zinc-500">/mo</span>}
          </div>
          <div className="flex gap-2">
            <ShareButton title={property.title} />
            <FavoriteButton propertyId={property.id} initiallyFavorited={isFavorited} mode="text" />
          </div>
        </div>
      </div>

      <PropertyGallery media={publicImages} defaultImage={defaultImage} />

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
              {property.description ? property.description : "No description provided by the seller."}
            </p>
          </section>

          <section className={`${property.is_verified ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900'} border rounded-2xl p-6`}>
            <h3 className={`text-xl font-bold ${property.is_verified ? 'text-emerald-900 dark:text-emerald-500' : 'text-amber-900 dark:text-amber-500'} mb-4 flex items-center`}>
              <ShieldCheck className="mr-2 h-6 w-6" /> {property.is_verified ? 'Verification Status: Verified' : 'Verification Status: Pending/Unverified'}
            </h3>
            
            {(() => {
              const checks = property.verification_checks || { 
                title_document: property.is_verified ? 'Verified' : 'Pending', 
                identity_verification: property.is_verified ? 'Verified' : 'Pending', 
                encumbrances: property.is_verified ? 'Verified' : 'Pending', 
                tax_receipts: property.is_verified ? 'Verified' : 'Pending' 
              }
              
              const labels: Record<string, string> = {
                title_document: 'Title Document',
                identity_verification: 'Identity Verification',
                encumbrances: 'Encumbrances Check',
                tax_receipts: 'Tax Receipts'
              }
              
              return (
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries(checks).map(([key, value]) => {
                    const isVerified = value === 'Verified'
                    const isPending = value === 'Pending'
                    
                    return (
                      <p key={key} className={`flex items-center gap-2 ${isVerified ? 'text-emerald-700 dark:text-emerald-500/80' : isPending ? 'text-amber-600 dark:text-amber-500/80' : 'text-red-600 dark:text-red-500/80'}`}>
                        {isVerified ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" /> 
                        ) : isPending ? (
                          <ShieldCheck className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                        )}
                        {labels[key] || key}: {String(value)}
                      </p>
                    )
                  })}
                </div>
              )
            })()}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Financial Tools</h2>
            {property.purpose === 'BUY' && (
              <div className="space-y-6">
                <EmiCalculator defaultPrice={property.price} />
                <RentVsBuyCalculator defaultPrice={property.price} />
              </div>
            )}
            {property.purpose === 'RENT' && (
              <RoiCalculator defaultPrice={0} />
            )}
          </section>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Location Map</h2>
            {isOwner ? (
              <PropertyMap location={`${property.location}, ${property.city}`} />
            ) : (
              <div className="w-full h-[400px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(8px)' }}></div>
                
                <div className="relative z-10 bg-white/90 dark:bg-zinc-950/90 p-6 rounded-2xl shadow-sm backdrop-blur-sm max-w-sm">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Location Protected</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    To protect the seller's privacy, the exact map pin is hidden.
                  </p>
                  <a href="#contact-agent" className="block w-full">
                    <Button variant="outline" className="w-full text-amber-700 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-500 dark:hover:bg-amber-950/30">
                      Contact Agent for Details
                    </Button>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1" id="contact-agent">
          <div className="sticky top-24">
            {isOwner ? (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-2xl p-6 text-center shadow-xl">
                <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-amber-500" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-zinc-900 dark:text-white">Your Listing</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  You are the owner of this property. You cannot send an enquiry to yourself.
                </p>
                <div className="space-y-3">
                  <Link href="/dashboard/seller">
                    <Button variant="outline" className="w-full border-amber-200 hover:bg-amber-100 text-amber-700 dark:border-amber-900/50 dark:text-amber-500 dark:hover:bg-amber-900/50">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={`/edit-property/${property.id}`} className="block w-full">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                      Edit Listing
                    </Button>
                  </Link>
                  <form action={deleteProperty as any}>
                    <input type="hidden" name="property_id" value={property.id} />
                    <Button type="submit" variant="destructive" className="w-full">
                      Delete Listing
                    </Button>
                  </form>
                </div>
              </div>
            ) : user ? (
              <BuyerInteractionTabs 
                propertyId={property.id} 
                buyerId={user.id} 
                initialEnquiryId={existingEnquiryId} 
                profile={userProfile} 
                hasEnquiry={!!existingEnquiryId}
              />
            ) : (
              <BuyerInteractionTabs 
                propertyId={property.id} 
                buyerId={null} 
                initialEnquiryId={null} 
                profile={null} 
                hasEnquiry={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
