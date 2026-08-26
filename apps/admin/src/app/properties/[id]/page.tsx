import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin'
import { ChevronLeft, Trash2, FileText, User, MapPin, Building, MessageSquare, CheckCircle2, ShieldCheck, Clock, Users, Store } from 'lucide-react'
import Link from 'next/link'
import { approveProperty, rejectProperty, holdProperty, hardDeleteProperty } from '@/app/actions'
import { PropertyMap } from '@/components/properties/PropertyMap'
import { ImageViewer } from '@/components/admin/ImageViewer'
import { VerificationModal } from '@/components/admin/VerificationModal'
import { DealStatusSelector } from '@/components/admin/DealStatusSelector'
import { HardDeleteButton } from '@/components/admin/HardDeleteButton'
import { formatIndianCurrencyShort } from '@/lib/formatPrice'

export const dynamic = 'force-dynamic'

export default async function AdminPropertyReviewPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const { id } = await params
  const sParams = await searchParams
  const currentTab = sParams.tab || 'details'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles ( full_name, email, phone, phone_number, account_id, role ),
      property_media ( url, media_type ),
      enquiries ( id, name, email, phone, message, status, created_at )
    `)
    .eq('id', id)
    .single()

  if (error || !property) {
    return <div className="p-8 text-center text-red-500 font-bold">Property not found</div>
  }

  const images = property.property_media?.filter((m: any) => m.media_type === 'IMAGE')?.map((m: any) => m.url) || []
  const documents = property.property_media?.filter((m: any) => m.media_type === 'DOCUMENT')?.map((m: any) => m.url) || []

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/seller-hub" className="p-2 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-500">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{property.title}</h1>
            <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
              <span className="text-blue-600 font-bold">{property.purpose}</span>
              <span>•</span>
              <MapPin className="h-3 w-3" /> {property.location?.includes("|") ? property.location.split("|")[1] : property.location}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-6">
        <Link href={`/properties/${id}?tab=details`} className={`pb-3 text-sm font-bold border-b-2 transition-all ${currentTab === 'details' ? 'border-blue-600 text-blue-700' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>
          <div className="flex items-center gap-2"><FileText className="h-4 w-4"/> View Details</div>
        </Link>
        <Link href={`/properties/${id}?tab=buyers`} className={`pb-3 text-sm font-bold border-b-2 transition-all ${currentTab === 'buyers' ? 'border-blue-600 text-blue-700' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>
          <div className="flex items-center gap-2"><Users className="h-4 w-4"/> Interested Buyers <span className="bg-zinc-100 text-zinc-700 rounded-full px-2 text-[10px]">{property.enquiries?.length || 0}</span></div>
        </Link>
        <Link href={`/properties/${id}?tab=seller`} className={`pb-3 text-sm font-bold border-b-2 transition-all ${currentTab === 'seller' ? 'border-blue-600 text-blue-700' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}>
          <div className="flex items-center gap-2"><Store className="h-4 w-4"/> Chat with Seller</div>
        </Link>
      </div>

      {/* Content */}
      <div className="mt-6">
        {currentTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-zinc-900">Property Media</h2>
                </div>
                <div className="p-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Public Photos</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {images.length > 0 ? images.map((url: string, i: number) => (
                      <ImageViewer key={i} url={url} alt={`Public Photo ${i+1}`}>
                        <img src={url} alt={`Thumbnail ${i+1}`} className="w-24 h-24 min-w-[6rem] object-cover rounded-lg border border-zinc-200" />
                      </ImageViewer>
                    )) : <div className="text-zinc-500 text-sm">No photos uploaded.</div>}
                  </div>
                  
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 mt-4">Internal Documents</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {documents.length > 0 ? documents.map((url: string, i: number) => (
                      <ImageViewer key={i} url={url} alt={`Document ${i+1}`}>
                        <img src={url} alt={`Doc Thumbnail ${i+1}`} className="w-24 h-24 min-w-[6rem] object-cover rounded-lg border border-zinc-200" />
                      </ImageViewer>
                    )) : <div className="text-zinc-500 text-sm">No documents uploaded.</div>}
                  </div>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                  <h2 className="font-bold text-zinc-900">Property Details</h2>
                </div>
                <div className="p-4 space-y-6">
                  
                  {/* Basic Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex flex-col justify-center">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Type</div>
                      <div className="font-bold text-sm text-zinc-900 break-words" title={property.type}>{property.type?.replace(/_/g, ' ') || 'N/A'}</div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex flex-col justify-center">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">BHK</div>
                      <div className="font-bold text-sm text-zinc-900">{property.bhk || 'N/A'}</div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex flex-col justify-center">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Area</div>
                      <div className="font-bold text-sm text-zinc-900">{property.area_sqft ? property.area_sqft + ' sq.ft' : 'N/A'}</div>
                    </div>
                    <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 flex flex-col justify-center">
                      <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">Price</div>
                      <div className="font-bold text-sm text-zinc-900">{formatIndianCurrencyShort(property.price) || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description</h3>
                    <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">{property.description || 'No description provided.'}</p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities && property.amenities.length > 0 ? property.amenities.map((amenity: string, i: number) => (
                        <span key={i} className="bg-zinc-100 text-zinc-700 text-xs px-2.5 py-1 rounded-md font-medium border border-zinc-200">
                          {amenity}
                        </span>
                      )) : <span className="text-sm text-zinc-500">None listed.</span>}
                    </div>
                  </div>

                  {/* Location & Map */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Location</h3>
                    <p className="text-sm text-zinc-700 mb-4">{property.location?.includes('|') ? property.location.split('|')[1] : property.location}, {property.city}</p>
                    <div className="h-64 rounded-xl overflow-hidden border border-zinc-200 relative">
                      <PropertyMap location={property.location + ', ' + property.city} />
                    </div>
                  </div>

                </div>
              </div>


            </div>
            
            <div className="space-y-6">
              
              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5">
                <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" /> Admin Controls
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-zinc-500 mb-2">VERIFICATION</div>
                    {property.verification_status === 'VERIFIED' ? (
                      <div className="space-y-2">
                        <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-emerald-100">
                          <CheckCircle2 className="h-4 w-4" /> Verified Active
                        </div>
                        <div className="flex gap-2">
                          <form action={async () => { 'use server'; await holdProperty(property.id); }} className="flex-1">
                            <button className="w-full bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">Put on Hold</button>
                          </form>
                          <form action={async () => { 'use server'; await rejectProperty(property.id); }} className="flex-1">
                            <button className="w-full bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Reject</button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <VerificationModal propertyId={property.id} />
                        <form action={async () => { 'use server'; await rejectProperty(property.id); }} className="flex-1">
                          <button className="w-full bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">Reject</button>
                        </form>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    <div className="text-xs font-bold text-zinc-500 mb-2">DEAL STATUS</div>
                    <DealStatusSelector propertyId={property.id} currentStatus={property.status} />
                  </div>

                  {property.is_deleted && (
                    <div className="pt-4 border-t border-red-100 mt-4">
                      <div className="text-xs font-bold text-red-600 mb-2">DANGER ZONE</div>
                      <form action={async () => {
                        'use server'
                        await hardDeleteProperty(property.id)
                        redirect('/seller-hub?filter=DELETED')
                      }}>
                        <HardDeleteButton onDelete={async () => {
                          'use server'
                          await hardDeleteProperty(property.id)
                          redirect('/seller-hub?filter=DELETED')
                        }} />
                        <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
                          This will completely remove the property from the database and wipe all associated media files from storage. This action cannot be undone.
                        </p>
                      </form>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-5">
                <h2 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" /> Seller Info
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <span className="text-zinc-500">Name</span>
                    <span className="font-bold text-zinc-900">{property.profiles?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <span className="text-zinc-500">Email</span>
                    <span className="font-medium text-zinc-900 truncate max-w-[150px]" title={property.profiles?.email}>{property.profiles?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <span className="text-zinc-500">Phone</span>
                    <span className="font-medium text-zinc-900">{property.profiles?.phone || property.profiles?.phone_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                    <span className="text-zinc-500">Role</span>
                    <span className="font-medium text-zinc-900 uppercase text-xs bg-zinc-100 px-2 py-0.5 rounded">{property.profiles?.role || 'User'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Account ID</span>
                    <span className="font-mono text-xs text-zinc-900 bg-zinc-50 px-1 py-0.5 rounded">{property.profiles?.account_id || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {currentTab === 'buyers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
              <h2 className="font-bold text-zinc-900">Interested Buyers ({property.enquiries?.length || 0})</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {property.enquiries?.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No buyers have enquired about this property yet.</div>
              ) : property.enquiries?.map((enq: any) => (
                <div key={enq.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                  <div>
                    <div className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                      {enq.name}
                      {enq.status === 'NEW' && <span className="bg-blue-100 text-blue-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-black">New</span>}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span>{enq.email}</span>
                      <span className="font-medium">{enq.phone}</span>
                      <span>Enquired: {new Date(enq.created_at).toLocaleDateString()}</span>
                    </div>
                    {enq.message && <p className="text-sm text-zinc-700 mt-2 p-3 bg-zinc-100 rounded-lg italic">"{enq.message}"</p>}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link href={`/messages?view=buyer&openChat=${enq.id}`} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 text-center flex items-center justify-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Chat with Buyer
                    </Link>
                    <Link href={`/messages?view=dual&propertyId=${property.id}&enquiryId=${enq.id}`} className="w-full md:w-auto bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 text-center flex items-center justify-center gap-2">
                      <Users className="h-4 w-4" /> Dual Chat Mode
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'seller' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Seller Communications</h2>
            <p className="text-zinc-500 mb-6 max-w-md mx-auto">
              Discuss verifications, required documents, or pricing adjustments directly with the seller.
            </p>
            <Link href={`/properties/${property.id}/seller-chat`} className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              <MessageSquare className="h-5 w-5" /> Open Full Screen Chat with Seller
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
