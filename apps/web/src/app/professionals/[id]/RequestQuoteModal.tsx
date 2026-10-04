'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Loader2, Send, X } from 'lucide-react'
import { createDirectRequest } from './actions'

export function RequestQuoteModal({ pro }: { pro: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const formData = new FormData(e.currentTarget)
      const res = await createDirectRequest(pro.id, formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        setTimeout(() => setIsOpen(false), 2000)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-medium text-lg py-6 shadow-md"
      >
        <Send className="w-5 h-5 mr-2" />
        Request Direct Quote
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Request Quote</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Send a direct message to {pro.company_name}.</p>
            </div>
            
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Request Sent!</h3>
                <p className="text-zinc-500">{pro.company_name} will review your request and get back to you with a quote.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg">{error}</div>}
                
                <div className="space-y-2">
                  <Label htmlFor="service_category">Service Needed</Label>
                  <select 
                    id="service_category" 
                    name="service_category" 
                    defaultValue={pro.category}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="WORKER">Worker / Labor</option>
                    <option value="DESIGNER">Interior Designer</option>
                    <option value="TRANSPORTER">Transporter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_approx">Approximate Budget (₹)</Label>
                  <Input id="budget_approx" name="budget_approx" type="number" placeholder="e.g. 50000" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="details">Project Details</Label>
                  <textarea className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" 
                    id="details" 
                    name="details" 
                    placeholder="Describe your project, timeline, and any specific requirements..." 
                    rows={4}
                    required 
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isSubmitting ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
