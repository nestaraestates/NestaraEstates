'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Send, X } from 'lucide-react'
import { submitQuote } from './actions'

export function QuoteModal({ request }: { request: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('request_id', request.id)
      const res = await submitQuote(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit quote')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)} className="w-full bg-brand-600 hover:bg-brand-700">
        Submit Quote
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Send Quotation</h2>
              <p className="text-sm text-zinc-500">Provide an estimate for {request.service_category}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-2 text-sm text-red-600 bg-red-50 rounded">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="quoted_amount">Your Estimated Price (₹)</Label>
                <Input id="quoted_amount" name="quoted_amount" type="number" required placeholder="e.g. 50000" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message to Customer</Label>
                <textarea 
                  id="message" 
                  name="message" 
                  required 
                  rows={4}
                  placeholder="Explain what is included in your quote, your timeline, and any other details..."
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {isSubmitting ? 'Sending...' : 'Send Quote'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
