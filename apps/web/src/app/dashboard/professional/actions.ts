'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadPortfolioItem(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const project_type = formData.get('project_type') as string
  const budget_range = formData.get('budget_range') as string
  const image = formData.get('image') as File | null

  if (!title || !image || image.size === 0) {
    return { error: 'Title and image are required.' }
  }

  // Upload image to storage
  const fileExt = image.name.split('.').pop()
  const fileName = `portfolio-${user.id}-${Date.now()}.${fileExt}`
  const buffer = await image.arrayBuffer()
  
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, buffer, { contentType: image.type })

  if (uploadError) {
    return { error: 'Failed to upload image.' }
  }

  const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)

  // Save to DB
  const { error: dbError } = await supabase.from('professional_portfolios').insert({
    professional_id: user.id,
    title,
    project_type,
    budget_range,
    media_urls: [publicUrlData.publicUrl]
  })

  if (dbError) {
    return { error: 'Failed to save portfolio record.' }
  }

  revalidatePath('/dashboard/professional')
  return { success: true }
}

export async function toggleAvailability(currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  await supabase.from('professional_profiles').update({
    is_available: !currentStatus
  }).eq('id', user.id)
  
  revalidatePath('/dashboard/professional')
}

export async function submitQuote(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const request_id = formData.get('request_id') as string
  const quoted_amount = parseFloat(formData.get('quoted_amount') as string) || 0
  const message = formData.get('message') as string

  // Check if already quoted
  const { data: existing } = await supabase.from('quotes')
    .select('id')
    .eq('request_id', request_id)
    .eq('professional_id', user.id)
    .single()

  if (existing) {
    return { error: 'You have already submitted a quote for this lead.' }
  }

  const { error } = await supabase.from('quotes').insert({
    request_id,
    professional_id: user.id,
    quoted_amount,
    message,
    status: 'PENDING'
  })

  if (error) return { error: 'Failed to submit quote.' }
  
  revalidatePath('/dashboard/professional')
  return { success: true }
}
