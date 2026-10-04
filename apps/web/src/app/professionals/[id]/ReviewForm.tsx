'use client'

import { useState } from 'react'
import { submitReview } from './actions'
import { Button } from '@/components/ui/button'
import { Star, Loader2 } from 'lucide-react'

export function ReviewForm({ professionalId }: { professionalId: string }) {
  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      const formData = new FormData(e.currentTarget)
      formData.append('professional_id', professionalId)
      formData.append('rating', rating.toString())
      const res = await submitReview(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        // Reset form
        (e.target as HTMLFormElement).reset()
        setRating(5)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Rating</label>
        <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
            >
              <Star 
                className={`w-8 h-8 ${(hoveredRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-surface-200'}`} 
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review_text" className="block text-sm font-medium text-surface-700 mb-2">Your Review</label>
        <textarea
          id="review_text"
          name="review_text"
          required
          rows={3}
          placeholder="Describe your experience working with this professional..."
          className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 resize-y"
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-brand-600 hover:bg-brand-700">
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Submitting...' : 'Post Review'}
        </Button>
      </div>
    </form>
  )
}
