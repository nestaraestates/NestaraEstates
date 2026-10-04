'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Edit, X } from 'lucide-react'
import { updateProfessionalProfile } from './actions'

export function EditProfileModal({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const formData = new FormData(e.currentTarget)
      const res = await updateProfessionalProfile(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="h-8 w-8 p-0 text-surface-400 hover:text-brand-600">
        <Edit className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Edit Profile</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-2 text-sm text-red-600 bg-red-50 rounded">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" name="company_name" defaultValue={profile.company_name} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years Exp.</Label>
                  <Input id="years_experience" name="years_experience" type="number" defaultValue={profile.years_experience} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service_radius_km">Service Radius (km)</Label>
                  <Input id="service_radius_km" name="service_radius_km" type="number" defaultValue={profile.service_radius_km} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_price_amount">Base Price (₹)</Label>
                  <Input id="base_price_amount" name="base_price_amount" type="number" defaultValue={profile.base_price_amount} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing_model">Pricing Model</Label>
                  <select 
                    id="pricing_model" 
                    name="pricing_model" 
                    defaultValue={profile.pricing_model}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PER_HOUR">Per Hour</option>
                    <option value="PER_SQFT">Per Sq.Ft.</option>
                    <option value="NEGOTIABLE">Negotiable</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
