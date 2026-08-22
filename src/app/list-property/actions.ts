'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitProperty(formData: FormData) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'You must be logged in to list a property.' }
  }

  // Extract form data
  const title = formData.get('title') as string || 'New Property Listing'
  const type = (formData.get('type') as string).toUpperCase() // e.g. VILLA
  const purpose = (formData.get('purpose') as string).toUpperCase() === 'FOR SALE' ? 'BUY' : 'RENT'
  const location = formData.get('location') as string
  const city = formData.get('city') as string || location.split(',')[0] || 'Unknown'
  const bhk = parseInt(formData.get('bhk') as string) || 0
  const area_sqft = parseFloat(formData.get('area') as string) || 0
  const bathrooms = parseInt(formData.get('bathrooms') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0

  // Insert into Supabase
  const { data, error } = await supabase
    .from('properties')
    .insert({
      owner_id: user.id,
      title,
      type,
      purpose,
      location,
      city,
      bhk,
      area_sqft,
      bathrooms,
      price,
      status: 'AVAILABLE',
      verification_status: 'UNVERIFIED'
    })
    .select()
    .single()

  if (error) {
    console.error('Error inserting property:', error)
    return { error: 'Failed to list property. Please try again.' }
  }

  // Handle Image Upload (simplified example for first file)
  const imageFile = formData.get('image') as File | null
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${data.id}-${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, imageFile)

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
      
      await supabase.from('property_media').insert({
        property_id: data.id,
        url: publicUrlData.publicUrl,
        media_type: 'IMAGE',
        is_featured: true
      })
    }
  }

  revalidatePath('/admin')
  revalidatePath('/buy')
  revalidatePath('/rent')
  revalidatePath('/')
  
  return { success: true, propertyId: data.id }
}
