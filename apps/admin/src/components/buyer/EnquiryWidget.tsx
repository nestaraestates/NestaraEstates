'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { submitEnquiry } from '@/app/property/[id]/actions'

interface EnquiryWidgetProps {
  propertyId: string
  profile: any
  forceOpen?: boolean
  onCancel?: () => void
}

export function EnquiryWidget({ propertyId, profile, forceOpen = false, onCancel }: EnquiryWidgetProps) {
  const [isOpen, setIsOpen] = useState(forceOpen)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formVals, setFormVals] = useState({
    name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone_number || '',
    address: profile?.address || ''
  })

  if (!isOpen) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm text-center dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Interested in this property?</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Contact our agents to negotiate or ask questions.</p>
        <Button onClick={() => setIsOpen(true)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold">
          Apply for Enquiry / Chat
        </Button>
      </div>
    )
  }

  return (
    <div className={forceOpen ? "p-6" : "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"}>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Contact Nestara Agent</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Please confirm your details. This will save to your profile for future use.
        </p>
      </div>

      <form 
        action={async (formData) => {
          setIsSubmitting(true)
          await submitEnquiry(formData)
          // Form submission will revalidate path, swapping this widget for the Chat component!
        }} 
        className="space-y-4 mb-6"
      >
        <input type="hidden" name="property_id" value={propertyId} />
        
        <div>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Full Name</label>
          <Input name="name" value={formVals.name} onChange={e => setFormVals({...formVals, name: e.target.value})} placeholder="Your Name" required className="bg-white dark:bg-zinc-900" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Email</label>
          <Input name="email" type="email" value={formVals.email} onChange={e => setFormVals({...formVals, email: e.target.value})} placeholder="Your Email" required className="bg-white dark:bg-zinc-900" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Phone Number</label>
          <Input name="phone" value={formVals.phone} onChange={e => setFormVals({...formVals, phone: e.target.value})} placeholder="Your Phone Number" required className="bg-white dark:bg-zinc-900" />
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Address</label>
          <Input name="address" value={formVals.address} onChange={e => setFormVals({...formVals, address: e.target.value})} placeholder="Your Residential Address" required className="bg-white dark:bg-zinc-900" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1 block">Message</label>
          <textarea 
            name="message" 
            className="w-full flex min-h-[80px] rounded-md border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-white" 
            placeholder="I am interested in viewing this property..." 
            required
          ></textarea>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => onCancel ? onCancel() : setIsOpen(false)} className="flex-1 bg-white dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold">
            {isSubmitting ? 'Sending...' : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  )
}
