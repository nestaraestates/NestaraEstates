'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be logged in to leave a review.' }

  const professional_id = formData.get('professional_id') as string
  const rating = parseInt(formData.get('rating') as string)
  const review_text = formData.get('review_text') as string

  if (!rating || rating < 1 || rating > 5) {
    return { error: 'Please select a valid rating from 1 to 5.' }
  }

  // Insert review
  const { error } = await supabase.from('professional_reviews').upsert({
    professional_id,
    customer_id: user.id,
    rating,
    review_text
  }, { onConflict: 'professional_id, customer_id' })

  if (error) {
    console.error(error)
    return { error: 'Failed to submit review. You may have already reviewed this professional.' }
  }

  revalidatePath(`/professionals/${professional_id}`)
  return { success: true }
}

export async function createDirectRequest(proId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to send a request.' }
  }

  const service_category = formData.get('service_category') as string
  const budget_approx = parseFloat(formData.get('budget_approx') as string)
  const userDetails = formData.get('details') as string
  
  // We use a prefix in the details column to securely identify targeted requests
  // without needing to alter the database schema to add a professional_id column
  const targetedDetails = `DIRECT_REQUEST_FOR:${proId} | ${userDetails}`

  const { error } = await supabase
    .from('service_requests')
    .insert({
      customer_id: user.id,
      service_category,
      budget_approx,
      details: targetedDetails,
      status: 'OPEN'
    })

  if (error) {
    console.error('Error creating direct request:', error)
    return { error: 'Failed to send request. Please try again.' }
  }

  revalidatePath('/dashboard/buyer')
  revalidatePath('/dashboard/professional')
  return { success: true }
}
