import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Missing required push subscription keys' }, { status: 400 })
    }

    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user.id,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      }, {
        onConflict: 'user_id, endpoint'
      })

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Subscription API Error:', err)
    return NextResponse.json({ error: 'Failed to process subscription' }, { status: 500 })
  }
}
