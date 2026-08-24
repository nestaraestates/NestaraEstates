'use server'

import { createClient } from '@/utils/supabase/server'

export async function sendDirectMessage(propertyId: string, receiverId: string | null, messageText: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  let finalReceiverId = receiverId
  
  // If no receiver is specified (e.g. Seller sending to "Admin"), find an admin ID
  if (!finalReceiverId || finalReceiverId === '00000000-0000-0000-0000-000000000000') {
    const { data: adminProfiles, error: lookupError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .in('email', ['nestaraestates@gmail.com', 'vineethbpawar@gmail.com'])
      .limit(1)
    
    if (lookupError) console.error("Admin lookup error:", lookupError)

    if (adminProfiles && adminProfiles.length > 0) {
      finalReceiverId = adminProfiles[0].id
    } else {
      console.error("No admin profile found in the database!")
      return { error: 'No admin available' }
    }
  }

  console.log(`Sending message from ${user.id} to ${finalReceiverId} for property ${propertyId}`)

  // Admin and Seller can both use this to chat about the property
  const { error } = await supabase.from('messages').insert({
    property_id: propertyId,
    sender_id: user.id,
    receiver_id: finalReceiverId,
    message: messageText
  })

  if (error) {
    console.error('Failed to send direct message:', error)
    return { error: 'Database error' }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || user.email === 'nestaraestates@gmail.com' || user.email === 'vineethbpawar@gmail.com'

  if (finalReceiverId) {
    await supabase.from('notifications').insert({
      user_id: finalReceiverId,
      title: isAdmin ? 'New Message from Admin' : 'New Message from Seller',
      content: isAdmin ? 'An admin sent you a message regarding your property.' : 'A seller sent you a direct message regarding their property.',
      link: isAdmin ? `/inbox?view=seller&openChat=${propertyId}` : `/admin/properties/${propertyId}/seller-chat`,
      is_read: false
    })
  }

  return { success: true }
}

export async function startChatEnquiry(propertyId: string, messageText: string, existingEnquiryId?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  let finalEnquiryId = existingEnquiryId

  // If no enquiry exists, create a shadow enquiry first!
  if (!finalEnquiryId) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { data: newEnq, error: enqError } = await supabase.from('enquiries').insert({
      property_id: propertyId,
      user_id: user.id,
      name: profile?.full_name || 'Anonymous Buyer',
      email: profile?.email || 'unknown@example.com',
      phone: profile?.phone_number || 'N/A',
      address: profile?.address || '',
      message: messageText,
      status: 'NEW'
    }).select('id').single()

    if (enqError || !newEnq) {
      console.error('Failed to create shadow enquiry:', enqError)
      return { error: 'Database error creating enquiry' }
    }
    finalEnquiryId = newEnq.id
  }

  // Find Admin ID
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('id')
    .in('email', ['nestaraestates@gmail.com', 'vineethbpawar@gmail.com'])
    .limit(1)

  const adminId = adminProfiles?.[0]?.id || null

  // Insert the chat message
  const { data: insertedMsg, error: msgError } = await supabase.from('messages').insert({
    enquiry_id: finalEnquiryId,
    property_id: propertyId,
    sender_id: user.id,
    receiver_id: adminId,
    message: messageText
  }).select('*').single()

  if (msgError) {
    console.error('Failed to send message:', msgError)
    return { error: 'Database error' }
  }

  // Notify Admin
  if (adminId) {
    await supabase.from('notifications').insert({
      user_id: adminId,
      title: 'New Message from Buyer',
      content: 'A buyer sent you a message about a property.',
      link: `/admin/properties/${propertyId}`,
      is_read: false
    })
  }

  return { success: true, enquiryId: finalEnquiryId, message: insertedMsg }
}
