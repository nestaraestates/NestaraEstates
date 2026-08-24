'use server'

import { createClient } from '@/utils/supabase/server'
import { isSuperAdmin } from '@/lib/admin'

export async function sendChatMessage(enquiryId: string, receiverId: string, messageText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!isSuperAdmin(user.email) && profile?.role !== 'admin') {
    return { error: 'Forbidden' }
  }

  const { error } = await supabase.from('messages').insert({
    enquiry_id: enquiryId,
    sender_id: user.id,
    receiver_id: receiverId,
    message: messageText
  })

  if (error) {
    console.error('Failed to send message:', error)
    return { error: 'Database error' }
  }

  if (receiverId) {
    await supabase.from('notifications').insert({
      user_id: receiverId,
      title: 'New Message from Agent',
      content: 'An agent has replied to your chat.',
      link: `/inbox?view=buyer&openChat=${enquiryId}`,
      is_read: false
    })
  }

  return { success: true }
}
