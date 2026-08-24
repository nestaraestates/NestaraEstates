export const runtime = "edge";
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const propertyId = '3e421994-8909-4c70-8954-5ac089640426' // The one from the video
  const sellerId = 'ff46b994-2502-4435-aca5-ce8e44be0ddc' // From the logs
  const adminId = user?.id || 'ff46b994-2502-4435-aca5-ce8e44be0ddc' // Just a fallback to see what fails

  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(10)

  return NextResponse.json({ 
    messages: data
  })
}
