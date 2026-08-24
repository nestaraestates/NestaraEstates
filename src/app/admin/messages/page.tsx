import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin'
import Link from 'next/link'
import { MessageSquare, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminInboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!isSuperAdmin(user.email) && profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch all enquiries (leads) with their associated properties
  // Sorted by latest created_at for now to mimic an inbox
  const { data: leads } = await supabase
    .from('enquiries')
    .select(`
      id, name, email, message, status, created_at,
      properties ( title )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
          <MessageSquare className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Admin Inbox</h1>
          <p className="text-zinc-500 font-medium">All incoming buyer chats and enquiries</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[500px]">
        {(!leads || leads.length === 0) ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
            <MessageSquare className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No messages or leads yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead: any) => (
              <Link 
                key={lead.id} 
                href={`/admin/crm/${lead.id}`}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-5 rounded-2xl border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-zinc-900">{lead.name}</h3>
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    Property: {lead.properties?.title || 'Unknown Property'}
                  </p>
                  <p className="text-sm text-zinc-600 line-clamp-1 italic">
                    "{lead.message || 'Started a chat session...'}"
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-zinc-400 group-hover:text-blue-600 transition-colors">
                  <span className="text-xs font-medium">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
