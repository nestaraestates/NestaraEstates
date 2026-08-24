import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { FullScreenSellerChat } from '@/components/admin/FullScreenSellerChat'

export const dynamic = 'force-dynamic'

export default async function SellerChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!isSuperAdmin(user.email) && profile?.role !== 'admin') {
    redirect('/')
  }

  const { data: property, error } = await supabase
    .from('properties')
    .select('*, profiles (full_name)')
    .eq('id', id)
    .single()

  if (error || !property) {
    return <div className="p-8">Property not found.</div>
  }

  // Fetch direct messages with seller
  const { data: messages } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('property_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="h-full flex flex-col -mx-4 -mt-4 md:mx-0 md:mt-0 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href={`/admin/properties/${id}`} className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 border border-zinc-200 hover:bg-zinc-100">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-bold text-zinc-900 leading-tight truncate max-w-[200px] sm:max-w-md">Chat with Seller: {property.profiles?.full_name || 'Unknown'}</h1>
            <p className="text-[10px] uppercase font-bold text-blue-600 truncate max-w-[200px] sm:max-w-md">{property.title}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <FullScreenSellerChat 
          propertyId={property.id} 
          sellerId={property.owner_id}
          initialMessages={messages || []} 
          adminId={user.id} 
        />
      </div>
    </div>
  )
}
