'use client'

import { useState } from 'react'
import { createServiceRequest } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { HardHat, Ruler, Calendar, IndianRupee, MapPin, Loader2, Home } from 'lucide-react'

export default function BuildYourHomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    
    
    try {
      const res = await createServiceRequest(formData)
      if (res?.error) setErrorMsg(res.error)
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 mb-6">
            <Home className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight mb-4">
            Build Your Dream Home
          </h1>
          <p className="text-lg text-surface-600">
            Tell us about your plot and vision. We will instantly connect you with verified Architects, Contractors, and Construction Workers in your city.
          </p>
        </div>

        <Card className="border-surface-200 shadow-xl overflow-hidden rounded-2xl">
          <div className="bg-brand-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <HardHat className="w-6 h-6" />
              Project Requirements
            </h2>
            <p className="text-brand-100 text-sm mt-1">Fill out the details below to generate quotes.</p>
          </div>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {errorMsg && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              
              <div className="space-y-3 mb-8">
                <Label htmlFor="service_category" className="flex items-center gap-2 text-surface-700">
                  <HardHat className="w-4 h-4 text-brand-500" /> What do you need help with?
                </Label>
                <select 
                  id="service_category" 
                  name="service_category" 
                  required 
                  className="flex h-12 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                >
                  <option value="">Select a service type...</option>
                  <option value="Full Home Construction">Full Home Construction</option>
                  <option value="Interior Design">Interior Design Only</option>
                  <option value="Renovation">Home Renovation & Remodeling</option>
                  <option value="Plumbing">Plumbing Services</option>
                  <option value="Electrical">Electrical Work</option>
                  <option value="Painting">Painting</option>
                  <option value="Carpentry">Carpentry & Woodwork</option>
                  <option value="Other">Other Maintenance Work</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="city" className="flex items-center gap-2 text-surface-700">
                    <MapPin className="w-4 h-4 text-brand-500" /> City / Location
                  </Label>
                  <Input id="city" name="city" required placeholder="e.g. Bengaluru" className="h-12 text-base" />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="plot_size" className="flex items-center gap-2 text-surface-700">
                    <Ruler className="w-4 h-4 text-brand-500" /> Plot Size (sq.ft)
                  </Label>
                  <Input id="plot_size" name="plot_size" type="number" required placeholder="e.g. 2400" className="h-12 text-base" />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="floors" className="flex items-center gap-2 text-surface-700">
                    <Home className="w-4 h-4 text-brand-500" /> Number of Floors
                  </Label>
                  <select 
                    id="floors" 
                    name="floors" 
                    required 
                    className="flex h-12 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  >
                    <option value="1">1 (Ground Only)</option>
                    <option value="2">2 (G + 1)</option>
                    <option value="3">3 (G + 2)</option>
                    <option value="4+">4+ Floors</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="budget_approx" className="flex items-center gap-2 text-surface-700">
                    <IndianRupee className="w-4 h-4 text-brand-500" /> Approximate Budget (₹)
                  </Label>
                  <Input id="budget_approx" name="budget_approx" type="number" required placeholder="e.g. 5000000" className="h-12 text-base" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="start_date" className="flex items-center gap-2 text-surface-700">
                  <Calendar className="w-4 h-4 text-brand-500" /> Expected Start Date
                </Label>
                <select 
                  id="start_date" 
                  name="start_date" 
                  required 
                  className="flex h-12 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                >
                  <option value="Immediately">Immediately</option>
                  <option value="Within 1 Month">Within 1 Month</option>
                  <option value="1-3 Months">1-3 Months</option>
                  <option value="Just exploring/No timeline">Just exploring (No strict timeline)</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-surface-700">Specific Requirements & Details</Label>
                <textarea 
                  id="description" 
                  name="description" 
                  required 
                  rows={4} 
                  placeholder="Describe your vision, preferred materials, or any special requirements like Vaastu compliance..."
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-base ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y p-4"
                />
              </div>

              <div className="pt-6 border-t border-surface-200">
                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full h-14 text-lg font-bold bg-brand-600 hover:bg-brand-700 shadow-md">
                  {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Generate Professional Quotes
                </Button>
                <p className="text-center text-sm text-surface-500 mt-4">
                  By submitting, you agree to let verified professionals contact you with quotations.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
