'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
  
  const village = formData.get('village') as string || ''
  const taluk = formData.get('taluk') as string || ''
  const city = formData.get('city') as string || ''
  const state = formData.get('state') as string || ''
  const country = formData.get('country') as string || ''
  
  const pincode = formData.get('pincode') as string || ''
  const rawLocation = [village, taluk, pincode].filter(Boolean).join(', ')
  const coords = formData.get('coordinates') as string
  const location = coords ? `${coords}|${rawLocation}` : rawLocation
  
  const bhk = parseInt(formData.get('bhk') as string) || 0
  const area_sqft = parseFloat(formData.get('area') as string) || 0
  const bathrooms = parseInt(formData.get('bathrooms') as string) || 0
  const price = parseFloat(formData.get('price') as string) || 0
  const description = formData.get('description') as string
  const owner_phone = formData.get('owner_phone') as string

  let propertyId = null

  try {
    // Update the seller's profile with their phone number if provided
    if (owner_phone) {
      await supabase.from('profiles').update({ phone_number: owner_phone }).eq('id', user.id)
    }

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
        description,
        status: 'AVAILABLE',
        verification_status: 'UNVERIFIED'
      })
      .select()
      .single()

    if (error) {
      console.error('DATABASE INSERT ERROR:', error)
      return { error: 'Failed to save property to database. Please try again.' }
    }
    
    propertyId = data.id
  } catch (err) {
    console.error('SERVER ACTION EXCEPTION:', err)
    return { error: 'An unexpected error occurred.' }
  }

  // Handle Image Uploads
  const imageFiles = formData.getAll('images') as File[]
  
  if (propertyId && imageFiles && imageFiles.length > 0) {
    let isFirst = true
    for (const imageFile of imageFiles) {
      if (imageFile.size === 0) continue

      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${propertyId}-${Math.random()}.${fileExt}`
      
      const buffer = await imageFile.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
        })

      if (uploadError) {
        console.error('SUPABASE STORAGE UPLOAD ERROR:', uploadError)
      } else {
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
        
        await supabase.from('property_media').insert({
          property_id: propertyId,
          url: publicUrlData.publicUrl,
          media_type: 'IMAGE',
          is_featured: isFirst
        })
        isFirst = false // Only the first one is featured
      }
    }
  }

  // Handle Legal Document Uploads
  const docDeed = formData.get('document_deed') as File | null
  const docTax = formData.get('document_tax') as File | null

  const uploadDocument = async (doc: File | null) => {
    if (!doc || doc.size === 0) return
    const fileExt = doc.name.split('.').pop()
    const fileName = `doc-${propertyId}-${Math.random()}.${fileExt}`
    const buffer = await doc.arrayBuffer()
    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, buffer, { contentType: doc.type })
    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
      await supabase.from('property_media').insert({
        property_id: propertyId,
        url: publicUrlData.publicUrl,
        media_type: 'DOCUMENT',
        is_featured: false
      })
    }
  }

  if (propertyId) {
    await uploadDocument(docDeed)
    await uploadDocument(docTax)
  }

  revalidatePath('/admin')
  revalidatePath('/buy')
  revalidatePath('/rent')
  revalidatePath('/')
  
  redirect('/dashboard/seller?success=Property listed successfully!')
}
