'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const fullName = formData.get('full_name') as string
  const phoneNumber = formData.get('phone_number') as string
  const address = formData.get('address') as string
  const whatsappEnabled = formData.get('whatsapp_enabled') === 'true'
  const primaryIntent = formData.get('primary_intent') as string
  const preferredCitiesStr = formData.get('preferred_cities') as string
  const companyName = formData.get('company_name') as string
  const bio = formData.get('bio') as string
  
  const preferredCities = preferredCitiesStr ? preferredCitiesStr.split(',').map(c => c.trim()) : []
  
  const password = formData.get('password') as string
  const avatarFile = formData.get('avatar') as File

  let avatarUrl = null
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)
      
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      avatarUrl = publicUrlData.publicUrl
    }
  }

  // Update profile
  const updatePayload: any = {
    full_name: fullName,
    phone_number: phoneNumber,
    address: address,
    whatsapp_enabled: whatsappEnabled,
    primary_intent: primaryIntent,
    preferred_cities: preferredCities,
    company_name: companyName,
    bio: bio
  }
  
  if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Update user metadata and conditionally set password
  const updateData: any = {
    data: { full_name: fullName }
  }
  
  if (password) {
    updateData.password = password
  }

  await supabase.auth.updateUser(updateData)

  redirect('/dashboard/profile?success=Profile+completed+successfully')
}
