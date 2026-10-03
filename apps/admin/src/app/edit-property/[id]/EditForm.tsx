'use client'

import { useState } from 'react'
import { adminUpdatePropertyDetails } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function EditForm({ property }: { property: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const res = await adminUpdatePropertyDetails(property.id, formData)
    
    if (res?.error) {
      setError(res.error)
      setIsSubmitting(false)
    } else {
      router.push('/properties')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
        <input 
          name="title" 
          defaultValue={property.title} 
          required 
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
        <textarea 
          name="description" 
          defaultValue={property.description || ''} 
          rows={4}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Price (₹)</label>
          <input 
            name="price" 
            type="number"
            defaultValue={property.price} 
            required 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
          <select 
            name="status" 
            defaultValue={property.status || 'AVAILABLE'} 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="AVAILABLE">Available</option>
            <option value="SOLD">Sold</option>
            <option value="RENTED">Rented</option>
            <option value="UNDER_NEGOTIATION">Under Negotiation</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">City</label>
          <input 
            name="city" 
            defaultValue={property.city} 
            required 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Location Area</label>
          <input 
            name="location" 
            defaultValue={property.location} 
            required 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-4 flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
