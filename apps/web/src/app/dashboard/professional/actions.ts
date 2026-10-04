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
  const images = formData.getAll('images') as File[]

  if (!title || images.length === 0 || images[0].size === 0) {
    return { error: 'Title and at least one image are required.' }
  }
  if (images.length > 3) {
    return { error: 'Maximum 3 images allowed per project.' }
  }

  const media_urls: string[] = []

  for (const image of images) {
    if (image.size === 0) continue;
    const fileExt = image.name.split('.').pop()
    const fileName = `portfolio-${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const buffer = await image.arrayBuffer()
    
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, buffer, { contentType: image.type })

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
      media_urls.push(publicUrlData.publicUrl)
    }
  }

  if (media_urls.length === 0) {
    return { error: 'Failed to upload images.' }
  }

  // Save to DB
  const { error: dbError } = await supabase.from('professional_portfolios').insert({
    professional_id: user.id,
    title,
    project_type,
    budget_range,
    media_urls
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


export async function uploadCompanyLogo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const image = formData.get('logo') as File | null
  if (!image || image.size === 0) return { error: 'Logo is required' }

  const fileExt = image.name.split('.').pop()
  const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`
  const buffer = await image.arrayBuffer()
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, buffer, { contentType: image.type, upsert: true })

  if (uploadError) return { error: 'Failed to upload logo' }

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName)

  await supabase.from('profiles').update({ avatar_url: publicUrlData.publicUrl }).eq('id', user.id)
  
  revalidatePath('/dashboard/professional')
  return { success: true }
}

export async function deletePortfolioItem(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('professional_portfolios')
    .delete()
    .eq('id', id)
    .eq('professional_id', user.id)

  if (error) return { error: 'Failed to delete project.' }
  
  revalidatePath('/dashboard/professional')
  return { success: true }
}

export async function updateProfessionalProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const company_name = formData.get('company_name') as string
  const years_experience = parseInt(formData.get('years_experience') as string) || 0
  const service_radius_km = parseInt(formData.get('service_radius_km') as string) || 50
  const base_price_amount = parseFloat(formData.get('base_price_amount') as string) || 0
  const pricing_model = formData.get('pricing_model') as string

  if (!company_name) return { error: 'Company Name is required' }

  const { error } = await supabase
    .from('professional_profiles')
    .update({
      company_name,
      years_experience,
      service_radius_km,
      base_price_amount,
      pricing_model
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update profile.' }
  
  revalidatePath('/dashboard/professional')
  return { success: true }
}

export async function updatePortfolioItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const project_type = formData.get('project_type') as string
  const budget_range = formData.get('budget_range') as string

  if (!id || !title) return { error: 'Project Title is required' }

  const { error } = await supabase
    .from('professional_portfolios')
    .update({ title, project_type, budget_range })
    .eq('id', id)
    .eq('professional_id', user.id)

  if (error) return { error: 'Failed to update project.' }
  
  revalidatePath('/dashboard/professional')
  return { success: true }
}
