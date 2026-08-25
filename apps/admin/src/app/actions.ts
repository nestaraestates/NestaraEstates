'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approvePropertyWithChecks(propertyId: string, checks: any) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ 
      is_verified: true, 
      verification_status: 'VERIFIED',
      verification_checks: checks
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Error approving property:', error)
    return { error: 'Failed to approve property' }
  }

  // Notify seller
  const { data: prop } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
  if (prop?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: prop.owner_id,
      title: 'Property Verified',
      content: 'Your property listing has been successfully verified by an administrator.',
      link: '/inbox?view=seller',
      is_read: false
    })
  }

  revalidatePath(`/admin/properties/${propertyId}`)
  revalidatePath('/', 'layout')
  revalidatePath('/buy')
  revalidatePath('/rent')
  return { success: true }
}

export async function approveProperty(propertyId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ 
      is_verified: true, 
      verification_status: 'VERIFIED' 
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Error approving property:', error)
    return { error: 'Failed to approve property' }
  }

  revalidatePath(`/admin/properties/${propertyId}`)
  revalidatePath('/', 'layout')
  revalidatePath('/buy')
  revalidatePath('/rent')
  return { success: true }
}

export async function rejectProperty(propertyId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('properties')
    .update({ 
      is_verified: false, 
      verification_status: 'REJECTED' 
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Error rejecting property:', error)
    return { error: 'Failed to reject property' }
  }

  revalidatePath(`/admin/properties/${propertyId}`)
  revalidatePath('/', 'layout')
  revalidatePath('/buy')
  revalidatePath('/rent')
  return { success: true }
}

export async function hardDeleteProperty(propertyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin' || user.email === 'nestaraestates@gmail.com' || user.email === 'vineethbpawar@gmail.com'
  
  if (!isAdmin) return { error: 'Unauthorized' }

  // 1. Fetch media URLs to delete the actual files from Storage
  const { data: mediaFiles } = await supabase
    .from('property_media')
    .select('url')
    .eq('property_id', propertyId)

  if (mediaFiles && mediaFiles.length > 0) {
    const fileNames = mediaFiles.map(media => {
      const parts = media.url.split('/')
      return parts[parts.length - 1]
    })
    
    if (fileNames.length > 0) {
      await supabase.storage.from('media').remove(fileNames)
    }
  }

  // 2. Hard Delete from Database
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId)

  if (error) {
    console.error('Admin hard delete error:', error)
    return { error: 'Failed to delete property' }
  }

  revalidatePath('/properties')
  return { success: true }
}

export async function updatePropertyDealStatus(propertyId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('properties')
    .update({ status })
    .eq('id', propertyId)

  if (error) {
    console.error('Failed to update deal status', error)
    throw new Error('Failed to update deal status')
  }

  revalidatePath('/seller-hub')
  revalidatePath(`/admin/properties/${propertyId}`)
}

export async function holdProperty(propertyId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('properties')
    .update({ 
      is_verified: false, 
      verification_status: 'UNVERIFIED' 
    })
    .eq('id', propertyId)

  if (error) {
    console.error('Failed to hold property', error)
    throw new Error('Failed to put property on hold')
  }

  revalidatePath('/seller-hub')
  revalidatePath(`/admin/properties/${propertyId}`)
}
