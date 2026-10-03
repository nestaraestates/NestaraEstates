'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { webpush } from '@/lib/webpush'


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

  
  // --- ADMIN AUDIT LOGGING ---
  try {
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (adminUser) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'VERIFIED_PROPERTY',
        target_id: propertyId,
        details: { timestamp: new Date().toISOString() }
      })
    }
  } catch(e) { console.error('Audit Log Error', e) }

  // --- PUSH NOTIFICATIONS ---
  try {
    const { data: propData } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
    if (propData?.owner_id) {
      const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', propData.owner_id)
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: 'Property Verified!',
          body: 'Your property is now live on Nestara Estates.',
          url: '/dashboard/seller'
        })
        for (const sub of subs) {
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
        }
      }
    }
  } catch (e) { console.error('Push Error', e) }
  
  revalidatePath(`/properties/${propertyId}`)
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

  
  // --- ADMIN AUDIT LOGGING ---
  try {
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (adminUser) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'VERIFIED_PROPERTY',
        target_id: propertyId,
        details: { timestamp: new Date().toISOString() }
      })
    }
  } catch(e) { console.error('Audit Log Error', e) }

  // --- PUSH NOTIFICATIONS ---
  try {
    const { data: propData } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
    if (propData?.owner_id) {
      const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', propData.owner_id)
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: 'Property Verified!',
          body: 'Your property is now live on Nestara Estates.',
          url: '/dashboard/seller'
        })
        for (const sub of subs) {
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
        }
      }
    }
  } catch (e) { console.error('Push Error', e) }
  
  revalidatePath(`/properties/${propertyId}`)
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

  
  // --- ADMIN AUDIT LOGGING ---
  try {
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (adminUser) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'REJECTED_PROPERTY',
        target_id: propertyId,
        details: { timestamp: new Date().toISOString() }
      })
    }
  } catch(e) { console.error('Audit Log Error', e) }

  // --- PUSH NOTIFICATIONS ---
  try {
    const { data: propData } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
    if (propData?.owner_id) {
      const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', propData.owner_id)
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: 'Property Rejected',
          body: 'Your property listing requires revisions.',
          url: '/dashboard/seller'
        })
        for (const sub of subs) {
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
        }
      }
    }
  } catch (e) { console.error('Push Error', e) }
  
  revalidatePath(`/properties/${propertyId}`)
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
  const isAdmin = (profile?.role === 'admin' || profile?.role === 'ADMIN') || user.email === 'nestaraestates@gmail.com' || user.email === 'vineethbpawar@gmail.com'
  
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

  
  // --- ADMIN AUDIT LOGGING ---
  try {
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (adminUser) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'DELETED_PROPERTY',
        target_id: propertyId,
        details: { timestamp: new Date().toISOString() }
      })
    }
  } catch(e) { console.error('Audit Log Error', e) }

  // --- PUSH NOTIFICATIONS ---
  try {
    const { data: propData } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
    if (propData?.owner_id) {
      const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', propData.owner_id)
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: 'Property Removed',
          body: 'Your property has been removed by an admin.',
          url: '/dashboard/seller'
        })
        for (const sub of subs) {
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
        }
      }
    }
  } catch (e) { console.error('Push Error', e) }
  
  revalidatePath('/properties')
  revalidatePath('/seller-hub')
  revalidatePath('/', 'layout')
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

  
  // --- ADMIN AUDIT LOGGING ---
  try {
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (adminUser) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'UPDATED_DEAL_STATUS',
        target_id: propertyId,
        details: { timestamp: new Date().toISOString() }
      })
    }
  } catch(e) { console.error('Audit Log Error', e) }

  // --- PUSH NOTIFICATIONS ---
  try {
    const { data: propData } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
    if (propData?.owner_id) {
      const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', propData.owner_id)
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: 'Deal Status Updated',
          body: 'Your property deal status has been updated by an admin.',
          url: '/dashboard/seller'
        })
        for (const sub of subs) {
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
        }
      }
    }
  } catch (e) { console.error('Push Error', e) }
  
  revalidatePath('/seller-hub')
  revalidatePath(`/properties/${propertyId}`)
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

  
  // --- ADMIN AUDIT LOGGING ---
  try {
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (adminUser) {
      await supabase.from('admin_audit_logs').insert({
        admin_id: adminUser.id,
        action: 'HELD_PROPERTY',
        target_id: propertyId,
        details: { timestamp: new Date().toISOString() }
      })
    }
  } catch(e) { console.error('Audit Log Error', e) }

  // --- PUSH NOTIFICATIONS ---
  try {
    const { data: propData } = await supabase.from('properties').select('owner_id').eq('id', propertyId).single()
    if (propData?.owner_id) {
      const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', propData.owner_id)
      if (subs && subs.length > 0) {
        const payload = JSON.stringify({
          title: 'Property On Hold',
          body: 'Your property verification has been paused.',
          url: '/dashboard/seller'
        })
        for (const sub of subs) {
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
        }
      }
    }
  } catch (e) { console.error('Push Error', e) }
  
  revalidatePath('/seller-hub')
  revalidatePath(`/properties/${propertyId}`)
}
