import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ArrowLeft, Edit3 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { EditForm } from './EditForm'

export const dynamic = 'force-dynamic'

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = (profile?.role === 'admin' || profile?.role === 'ADMIN') || user.email === 'nestaraestates@gmail.com' || user.email === 'vineethbpawar@gmail.com'
  
  if (!isAdmin) redirect('/')

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) return notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/properties" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-indigo-600" />
            Edit Property
          </h1>
          <p className="text-zinc-500 text-sm">Update property details directly from the admin console.</p>
        </div>
      </div>

      <Card className="p-6 md:p-8 shadow-sm border-zinc-200">
        <EditForm property={property} />
      </Card>
    </div>
  )
}
