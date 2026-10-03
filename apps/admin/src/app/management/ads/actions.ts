'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAd(slot_number: number, image_url: string, redirect_url: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.from('mobile_ads').insert({
    slot_number,
    image_url,
    redirect_url,
    is_active: true
  })
  if (error) throw new Error(error.message)
  
  revalidatePath('/management/ads')
}

export async function toggleAdStatus(id: string | number, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('mobile_ads').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/management/ads')
}

export async function deleteAd(id: string | number) {
  const supabase = await createClient()
  const { error } = await supabase.from('mobile_ads').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/management/ads')
}
