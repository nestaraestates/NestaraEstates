'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitEnquiry(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const property_id = formData.get('property_id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string
  const message = formData.get('message') as string

  // 1. Insert the enquiry
  const { error } = await supabase.from('enquiries').insert({
    property_id,
    user_id: user?.id || null,
    name,
    email,
    phone,
    address,
    message,
    status: 'NEW'
  })

  if (error) {
    console.error('Error submitting enquiry:', error)
    return { error: 'Failed to send enquiry.' }
  }

  // Notify Admins
  const { data: adminProfiles } = await supabase
    .from('profiles')
    .select('id')
    .in('email', ['nestaraestates@gmail.com', 'vineethbpawar@gmail.com'])
    .limit(1)
    
  if (adminProfiles && adminProfiles.length > 0) {
    await supabase.from('notifications').insert({
      user_id: adminProfiles[0].id,
      title: 'New Property Enquiry',
      content: `${name} has sent a new enquiry for a property!`,
      link: `/properties/${property_id}`,
      is_read: false
    })
  }

  // 2. If user is logged in, save these details to their profile so they don't have to type it again!
  if (user) {
    await supabase.from('profiles').update({
      full_name: name,
      phone_number: phone,
      address: address
    }).eq('id', user.id)
  }

  revalidatePath(`/property/${property_id}`)
  return { success: true }
}

import { redirect } from 'next/navigation'

export async function deleteProperty(formData: FormData) {
  const propertyId = formData.get('property_id') as string
  if (!propertyId) return { error: 'Property ID missing' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', propertyId)
    .single()

  if (property?.owner_id !== user.id) {
    return { error: 'Unauthorized to delete this property' }
  }

  // Soft delete the property instead of hard deleting.
  // This keeps the photos and records for the admin to review.
  const { error } = await supabase
    .from('properties')
    .update({ 
      is_deleted: true,
      status: 'DELETED'
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Delete error:', error)
    return { error: 'Failed to delete property' }
  }

  revalidatePath('/dashboard/seller')
  revalidatePath('/buy')
  revalidatePath('/rent')
  
  redirect('/dashboard/seller?success=Listing deleted successfully')
}
