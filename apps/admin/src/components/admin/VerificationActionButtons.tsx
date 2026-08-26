'use client'

import { useTransition } from 'react'
import { holdProperty, rejectProperty } from '@/app/actions'

export function VerificationActionButtons({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex gap-2 w-full mt-2">
      <button 
        onClick={() => startTransition(async () => await holdProperty(propertyId))}
        disabled={isPending}
        className="flex-1 bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Working...' : 'Put on Hold'}
      </button>
      <button 
        onClick={() => startTransition(async () => await rejectProperty(propertyId))}
        disabled={isPending}
        className="flex-1 bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Working...' : 'Reject'}
      </button>
    </div>
  )
}

export function RejectButtonOnly({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button 
      onClick={() => startTransition(async () => await rejectProperty(propertyId))}
      disabled={isPending}
      className="flex-1 bg-red-50 text-red-600 border border-red-100 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-50 w-full"
    >
      {isPending ? 'Working...' : 'Reject'}
    </button>
  )
}
