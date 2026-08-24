'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scale, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CompareFloatingButton() {
  const [compareIds, setCompareIds] = useState<string[]>([])

  useEffect(() => {
    const loadCompare = () => {
      const stored = localStorage.getItem('nestara_compare')
      if (stored) {
        setCompareIds(JSON.parse(stored))
      } else {
        setCompareIds([])
      }
    }

    loadCompare()

    // Listen for custom event when items are added/removed
    window.addEventListener('compare-updated', loadCompare)
    return () => window.removeEventListener('compare-updated', loadCompare)
  }, [])

  if (compareIds.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white dark:bg-zinc-950 p-3 rounded-full shadow-2xl border border-amber-200 dark:border-amber-900 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 pl-2">
        <Scale className="h-5 w-5 text-amber-500" />
        <span className="text-sm font-bold">{compareIds.length}</span>
      </div>
      
      <Link href={`/compare?ids=${compareIds.join(',')}`}>
        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-6">
          Compare
        </Button>
      </Link>

      <button 
        onClick={() => {
          localStorage.removeItem('nestara_compare')
          window.dispatchEvent(new Event('compare-updated'))
        }}
        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
        title="Clear comparison list"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
