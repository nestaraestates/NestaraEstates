'use client'

import { useState } from 'react'
import { registerProfessional } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Hammer, Truck, Paintbrush, Briefcase, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'

const CATEGORIES = [
  { id: 'DESIGNER', title: 'Interior Designer', icon: Paintbrush, desc: '3D renders, floor plans, and space styling.', color: 'text-purple-600', bg: 'bg-purple-100' },
  { id: 'WORKER', title: 'Construction Worker', icon: Hammer, desc: 'Masons, Carpenters, Plumbers, and Electricians.', color: 'text-amber-600', bg: 'bg-amber-100' },
  { id: 'TRANSPORTER', title: 'Transporter', icon: Truck, desc: 'House shifting and material transport.', color: 'text-blue-600', bg: 'bg-blue-100' }
]

export default function JoinProfessionalPage() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const activeCategory = CATEGORIES.find(c => c.id === selectedCat)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    const formData = new FormData(e.currentTarget)
    formData.append('category', selectedCat || '')
    
    try {
      const res = await registerProfessional(formData)
      if (res?.error) setErrorMsg(res.error)
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-surface-900 tracking-tight sm:text-5xl mb-4">
          Grow your business with <span className="text-brand-600">Nestara</span>
        </h1>
        <p className="text-xl text-surface-600 max-w-2xl mx-auto">
          Join an exclusive network of professionals connecting with property buyers and owners. List your services, get qualified leads, and manage your projects in one place.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {!selectedCat ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-surface-900 text-center mb-8">What is your profession?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  className="group relative flex flex-col items-center p-8 bg-white rounded-2xl border-2 border-transparent shadow-sm hover:border-brand-500 hover:shadow-md transition-all text-center"
                >
                  <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-surface-900 mb-2">{cat.title}</h3>
                  <p className="text-sm text-surface-500">{cat.desc}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-16 bg-white p-8 rounded-2xl border border-surface-200 shadow-sm">
              <h3 className="text-xl font-bold text-surface-900 mb-6 text-center">Why join Nestara Professionals?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-surface-900">Premium Qualified Leads</h4>
                    <p className="text-sm text-surface-600 mt-1">Get direct access to highly qualified leads and high-budget projects with our transparent partnership model.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-surface-900">Verified Customer Base</h4>
                    <p className="text-sm text-surface-600 mt-1">Get access to motivated users actively buying, renting, or renovating their homes on Nestara.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="border-surface-200 shadow-lg">
            <CardHeader className="bg-surface-50/50 border-b border-surface-100">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedCat(null)}
                  className="p-2 hover:bg-surface-200 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-surface-500 rotate-180" />
                </button>
                <div className={`p-2 rounded-lg ${activeCategory?.bg} ${activeCategory?.color}`}>
                  {activeCategory && <activeCategory.icon className="w-6 h-6" />}
                </div>
                <div>
                  <CardTitle className="text-2xl">Become a {activeCategory?.title}</CardTitle>
                  <CardDescription>Fill out your professional profile to start getting leads.</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
                    {errorMsg}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company / Individual Name</Label>
                    <Input id="company_name" name="company_name" required placeholder="e.g. Modern Spaces Design" className="h-11" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sub_category">Specialization</Label>
                    <select 
                      id="sub_category" 
                      name="sub_category" 
                      required 
                      className="flex h-11 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                    >
                      <option value="">Select a specialty...</option>
                      {selectedCat === 'WORKER' && (
                        <>
                          <option value="Mason">Mason (Stone Worker)</option>
                          <option value="Carpenter">Carpenter</option>
                          <option value="Plumber">Plumber</option>
                          <option value="Electrician">Electrician</option>
                          <option value="Painter">Painter</option>
                          <option value="General Labour">General Labour</option>
                        </>
                      )}
                      {selectedCat === 'DESIGNER' && (
                        <>
                          <option value="Residential">Residential Design</option>
                          <option value="Commercial">Commercial Design</option>
                          <option value="Renovation">Renovation & Remodeling</option>
                        </>
                      )}
                      {selectedCat === 'TRANSPORTER' && (
                        <>
                          <option value="House Shifting">House Shifting</option>
                          <option value="Material Transport">Construction Material</option>
                          <option value="Furniture">Furniture Delivery</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input id="years_experience" name="years_experience" type="number" required min="0" placeholder="e.g. 5" className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service_radius_km">Service Radius (in KM)</Label>
                    <Input id="service_radius_km" name="service_radius_km" type="number" required min="1" max="500" defaultValue="50" className="h-11" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricing_model">Pricing Model</Label>
                    <select 
                      id="pricing_model" 
                      name="pricing_model" 
                      required 
                      className="flex h-11 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                    >
                      <option value="NEGOTIABLE">Negotiable (Ask for Quote)</option>
                      <option value="PER_HOUR">Per Hour</option>
                      <option value="PER_SQFT">Per Sq. Ft.</option>
                      <option value="PER_KM">Per KM</option>
                      <option value="FIXED">Fixed Price</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="base_price_amount">Starting / Base Price (₹)</Label>
                    <Input id="base_price_amount" name="base_price_amount" type="number" required min="0" placeholder="e.g. 500" className="h-11" />
                  </div>
                </div>

                <div className="pt-6 border-t border-surface-200 flex justify-end">
                  <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto px-8 h-12 text-base font-bold bg-brand-600 hover:bg-brand-700">
                    {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Create Professional Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
