export const runtime = "edge";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Inbox as InboxIcon, ShoppingBag, Store, ArrowRight, MessageSquare } from 'lucide-react'
import { BuyerDirectChat } from '@/components/buyer/BuyerDirectChat'
import { SellerDirectChat } from '@/components/seller/SellerDirectChat'

export const dynamic = 'force-dynamic'

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams;
  const view = typeof resolvedParams.view === 'string' ? resolvedParams.view : 'buyer'
  const openChat = typeof resolvedParams.openChat === 'string' ? resolvedParams.openChat : ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Admins still get routed to their master CRM automatically
  if (profile?.role === 'admin') {
    redirect('/admin/crm')
  }

  // Fetch Buyer Enquiries (Things they are trying to buy)
  const { data: buyerEnquiries } = await supabase
    .from('enquiries')
    .select('id, message, status, created_at, properties(id, title, location, city)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch Seller Properties & Enquiries (Things they are trying to sell)
  const { data: sellerProperties } = await supabase
    .from('properties')
    .select('id, title, location, city, status, is_verified')
    .eq('owner_id', user.id)

  const { data: sellerLeads } = await supabase
    .from('enquiries')
    .select('id, message, status, created_at, properties!inner(id, title)')
    .eq('properties.owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
          <InboxIcon className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Messages Hub</h1>
          <p className="text-zinc-500 font-medium">Manage all your communications with Nestara Agents</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <Link 
          href="?view=buyer" 
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-lg ${view === 'buyer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300'}`}
        >
          <ShoppingBag className="h-6 w-6" /> 
          Buyer Inbox
        </Link>
        <Link 
          href="?view=seller" 
          className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-lg ${view === 'seller' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300'}`}
        >
          <Store className="h-6 w-6" /> 
          Seller Inbox
        </Link>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[500px]">
        {/* BUYER VIEW */}
        {view === 'buyer' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-600" /> My Buying Enquiries
            </h2>
            
            {(!buyerEnquiries || buyerEnquiries.length === 0) ? (
              <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
                <MessageSquare className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">You haven't enquired about any properties yet.</p>
                <Link href="/buy" className="text-emerald-600 font-bold mt-2 inline-block hover:underline">
                  Browse Properties <ArrowRight className="h-4 w-4 inline" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {buyerEnquiries.map((enq: any) => (
                  <div key={enq.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-emerald-200 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <Link href={`/property/${enq.properties.id}`} className="font-bold text-lg text-emerald-700 hover:underline">
                          {enq.properties.title}
                        </Link>
                        <p className="text-sm text-zinc-500 mb-2">{enq.properties.location}, {enq.properties.city}</p>
                        <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100 italic text-sm text-zinc-600">
                          "{enq.message}"
                        </div>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">
                          {enq.status}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <BuyerDirectChat initialEnquiryId={enq.id} propertyId={enq.properties.id} buyerId={user.id} autoOpen={openChat === enq.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SELLER VIEW */}
        {view === 'seller' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-amber-600" /> Direct Property Support
              </h2>
              <p className="text-sm text-zinc-500 mb-4">Chat with Nestara agents directly regarding your listed properties (verification, updates, etc).</p>
              
              {(!sellerProperties || sellerProperties.length === 0) ? (
                <div className="text-center py-10 border-2 border-dashed border-zinc-200 rounded-2xl">
                  <p className="text-zinc-500 font-medium">You haven't listed any properties to sell.</p>
                  <Link href="/list-property" className="text-amber-600 font-bold mt-2 inline-block hover:underline">
                    List a Property <ArrowRight className="h-4 w-4 inline" />
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {sellerProperties.map((prop: any) => (
                    <div key={prop.id} className="border border-zinc-200 rounded-2xl p-5 hover:border-amber-200 transition-colors flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-900 line-clamp-1">{prop.title}</h3>
                        <p className="text-xs text-zinc-500 mb-3">{prop.city}</p>
                      </div>
                      <SellerDirectChat propertyId={prop.id} sellerId={user.id} autoOpen={openChat === prop.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {sellerLeads && sellerLeads.length > 0 && (
              <div className="pt-8 border-t border-zinc-200">
                <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" /> Buyer Leads on your Properties
                </h2>
                <div className="space-y-4">
                  {sellerLeads.map((lead: any) => (
                    <div key={lead.id} className="border border-zinc-200 rounded-2xl p-5 bg-amber-50/30">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-amber-800">Lead for: {lead.properties.title}</span>
                        <span className="text-xs text-zinc-500">{new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-zinc-600">An agent is actively handling a buyer enquiry for this property. We will contact you once an official offer is prepared.</p>
                      <div className="mt-4">
                        <SellerDirectChat propertyId={lead.properties.id} sellerId={user.id} autoOpen={openChat === lead.properties.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
