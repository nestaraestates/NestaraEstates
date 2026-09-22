import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DualChatBoard } from '@/components/admin/DualChatBoard'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CrmChatPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params;
  const enquiryId = id

  const [enquiryRes, messagesRes] = await Promise.all([
    supabase
      .from('enquiries')
      .select(`
        *,
        properties ( id, title, owner_id )
      `)
      .eq('id', enquiryId)
      .single(),
    supabase
      .from('messages')
      .select('*')
      .eq('enquiry_id', enquiryId)
      .order('created_at', { ascending: true })
  ])

  if (enquiryRes.error || !enquiryRes.data) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Enquiry Not Found</h2>
        <p className="text-zinc-500 mb-6">The chat session you are looking for does not exist or you do not have access.</p>
        <Link href="/messages" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
          Back to Inbox
        </Link>
      </div>
    )
  }

  const enquiry = enquiryRes.data
  const messages = messagesRes.data || []

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] w-full max-w-4xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-200 bg-white shrink-0">
        <Link href="/messages" className="p-2 hover:bg-zinc-100 rounded-full transition-colors group">
          <ChevronLeft className="h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
        </Link>
        <div>
          <h1 className="font-bold text-zinc-900 text-lg leading-tight">{enquiry.name}</h1>
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">Property: {enquiry.properties?.title}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        <DualChatBoard enquiry={enquiry} initialMessages={messages} adminId={user.id} />
      </div>
    </div>
  )
}
