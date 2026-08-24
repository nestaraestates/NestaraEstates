'use client'

import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteProperty } from '@/app/property/[id]/actions'
import { useTransition } from 'react'

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <form action={(formData) => {
      if (window.confirm('Are you sure you want to permanently delete this listing? All messages, data, and photos will be erased.')) {
        startTransition(() => {
          deleteProperty(formData)
        })
      }
    }}>
      <input type="hidden" name="property_id" value={propertyId} />
      <Button 
        type="submit" 
        variant="destructive" 
        size="sm" 
        disabled={isPending}
        className="h-10 px-4 rounded-lg font-bold bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isPending ? 'Deleting...' : 'Delete'}
      </Button>
    </form>
  )
}
