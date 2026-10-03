'use server'

import { createClient } from '@/utils/supabase/server'
import { webpush } from '@/lib/webpush'

export async function broadcastAnnouncement(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const link = (formData.get('link') as string) || '/'
  
  if (!title || !content) {
    return { error: 'Title and content are required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify Admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isSuper = user.email === 'nestaraestates@gmail.com' || user.email === 'vineethbpawar@gmail.com'
  if (profile?.role !== 'ADMIN' && profile?.role !== 'SUPER_ADMIN' && !isSuper) {
    return { error: 'Unauthorized' }
  }

  // 1. Fetch all users
  const { data: allUsers, error: usersErr } = await supabase.from('profiles').select('id')
  if (usersErr || !allUsers) return { error: 'Failed to fetch users' }

  // 2. Prepare notifications array (Batch insert up to 500 at a time to be safe)
  const notifications = allUsers.map((u: any) => ({
    user_id: u.id,
    title,
    content,
    link,
    is_read: false
  }))

  const chunkSize = 500;
  for (let i = 0; i < notifications.length; i += chunkSize) {
    const chunk = notifications.slice(i, i + chunkSize);
    await supabase.from('notifications').insert(chunk)
  }

  // 3. Send Web Push to all subscribers
  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  
  if (subs && subs.length > 0) {
    const payload = JSON.stringify({
      title,
      body: content,
      url: link
    })

    const pushPromises = subs.map(async (sub: any) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, payload)
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id)
        }
      }
    })

    await Promise.allSettled(pushPromises)
  }

  
  // 3.5 Send Expo Push (OS-Level Mobile Push) to all valid app users in safe chunks
  const { data: expoUsers } = await supabase
    .from('profiles')
    .select('push_token')
    .not('push_token', 'is', null);

  if (expoUsers && expoUsers.length > 0) {
    // Filter out empty strings just in case
    const validTokens = expoUsers.map(u => u.push_token).filter(token => token && token.trim() !== '');
    
    // Expo allows a maximum of 100 tickets per request
    const EXPO_CHUNK_SIZE = 100;
    
    for (let i = 0; i < validTokens.length; i += EXPO_CHUNK_SIZE) {
      const tokenChunk = validTokens.slice(i, i + EXPO_CHUNK_SIZE);
      
      const messages = tokenChunk.map(token => ({
        to: token,
        sound: 'default',
        title: title || 'Nestara Estates',
        body: content || 'You have a new announcement.',
        data: { link: link }
      }));

      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });
      } catch (err) {
        console.error('Failed to send Expo chunk:', err);
      }
    }
  }

  // 4. Log Audit Action

  await supabase.from('admin_audit_logs').insert({
    admin_id: user.id,
    action: 'BROADCAST_ANNOUNCEMENT',
    target_id: 'ALL_USERS',
    details: { title, content }
  })

  return { success: true, count: allUsers.length }
}
