'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerProfessional(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to register as a professional.' }
  }

  const category = formData.get('category') as string
  const sub_category = formData.get('sub_category') as string
  const company_name = formData.get('company_name') as string
  const years_experience = parseInt(formData.get('years_experience') as string) || 0
  const service_radius_km = parseInt(formData.get('service_radius_km') as string) || 50
  const base_price_amount = parseFloat(formData.get('base_price_amount') as string) || 0
  const pricing_model = formData.get('pricing_model') as string

  // 1. Update Profile's professional_type array
  const { data: profile } = await supabase.from('profiles').select('professional_type').eq('id', user.id).single()
  const existingTypes = profile?.professional_type || []
  if (!existingTypes.includes(category)) {
    await supabase.from('profiles').update({
      professional_type: [...existingTypes, category]
    }).eq('id', user.id)
  }

  // 2. Insert into professional_profiles
  const { error } = await supabase.from('professional_profiles').upsert({
    id: user.id,
    category,
    sub_category,
    company_name,
    years_experience,
    service_radius_km,
    base_price_amount,
    pricing_model,
    is_available: true,
    verification_level: 1
  })

  if (error) {
    console.error('Registration Error:', error)
    return { error: 'Failed to register your profile. Please try again.' }
  }

  redirect('/dashboard/professional?success=Welcome to Nestara Professionals!')
}
