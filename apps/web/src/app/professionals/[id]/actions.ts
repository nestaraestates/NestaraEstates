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
