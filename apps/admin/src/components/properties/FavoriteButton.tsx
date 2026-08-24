'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/app/actions/favorites'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

export function FavoriteButton({ propertyId, initiallyFavorited = false, mode = 'icon' }: { propertyId: string, initiallyFavorited?: boolean, mode?: 'icon' | 'text' }) {
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited)
  const [isPending, startTransition] = useTransition()
  const pathname = usePathname()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsFavorited(!isFavorited)
    
    startTransition(async () => {
      const result = await toggleFavorite(propertyId, pathname)
      if (result.error) {
        setIsFavorited(isFavorited)
      } else if (result.success && result.isFavorited !== undefined) {
        setIsFavorited(result.isFavorited)
      }
    })
  }

  if (mode === 'text') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleToggle}
        disabled={isPending}
      >
        <Heart className={`h-4 w-4 mr-2 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} /> 
        {isFavorited ? 'Saved' : 'Save'}
      </Button>
    )
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-all hover:scale-110 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-800 disabled:opacity-70"
    >
      <Heart 
        className={`h-4 w-4 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-zinc-600 dark:text-zinc-400'}`} 
      />
    </button>
  )
}
