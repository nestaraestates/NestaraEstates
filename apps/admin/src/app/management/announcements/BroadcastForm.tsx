'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { broadcastAnnouncement } from './actions'

export function BroadcastForm() {
  const [isPending, setIsPending] = useState(false)
  const [successCount, setSuccessCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccessCount(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await broadcastAnnouncement(formData)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccessCount(result.count || 0)
        e.currentTarget.reset()
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsPending(false)
    }
  }

  if (successCount !== null) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Broadcast Successful!</h3>
          <p className="text-zinc-500 mt-2">Your announcement was securely delivered to {successCount.toLocaleString()} users.</p>
        </div>
        <button 
          onClick={() => setSuccessCount(null)}
          className="mt-4 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-lg transition-colors"
        >
          Send Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-semibold text-zinc-900 mb-1">
          Announcement Title
        </label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          required
          placeholder="e.g., Scheduled Maintenance this Sunday"
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-semibold text-zinc-900 mb-1">
          Message Body
        </label>
        <textarea 
          id="content" 
          name="content" 
          required
          rows={4}
          placeholder="Type the full announcement details here..."
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 resize-y"
        />
      </div>

      <div>
        <label htmlFor="link" className="block text-sm font-semibold text-zinc-900 mb-1">
          Target Link <span className="text-zinc-400 font-normal">(Optional)</span>
        </label>
        <input 
          type="text" 
          id="link" 
          name="link" 
          placeholder="e.g., /properties or https://blog.nestara.com/update"
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <p className="text-xs text-zinc-500 mt-1">Where should users be taken when they tap the notification?</p>
      </div>

      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Broadcasting to all users...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Broadcast Now
            </>
          )}
        </button>
      </div>
    </form>
  )
}
