'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function createServiceRequest(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to request a service.' }
  }

  const service_category = formData.get('service_category') as string // e.g. CONSTRUCTION
  const city = formData.get('city') as string
  const plot_size = formData.get('plot_size') as string
  const floors = formData.get('floors') as string
  const budget_approx = parseFloat(formData.get('budget_approx') as string) || 0
  const start_date = formData.get('start_date') as string
  const description = formData.get('description') as string

  const location_data = {
    city,
    plot_size_sqft: plot_size,
    number_of_floors: floors,
    expected_start: start_date
  }

  const { error } = await supabase.from('service_requests').insert({
    customer_id: user.id,
    service_category,
    location_data,
    budget_approx,
    details: description,
    status: 'OPEN'
  })

  if (error) {
    console.error('Request Error:', error)
    return { error: 'Failed to submit your request. Please try again.' }
  }

  redirect('/dashboard/buyer?success=Your request has been sent to matching professionals!')
}
