export const runtime = "edge";
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { enquiry_id, property_id, message } = body

  // Find admin
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('id, email, role')
    .or('role.eq.admin,email.eq.nestaraestates@gmail.com,email.eq.vineethbpawar@gmail.com')
    .limit(1)

  const receiver_id = adminProfiles?.[0]?.id

  if (!receiver_id) return NextResponse.json({ error: 'No admin available' }, { status: 500 })

  const { error } = await supabase.from('messages').insert({
    enquiry_id,
    property_id,
    sender_id: user.id,
    receiver_id,
    message
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
