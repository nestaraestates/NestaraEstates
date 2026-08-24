'use client'

import { useState, useEffect } from 'react'
import { Scale } from 'lucide-react'

export function CompareToggleButton({ propertyId }: { propertyId: string }) {
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    const checkStatus = () => {
      const stored = localStorage.getItem('nestara_compare')
      if (stored) {
        const ids = JSON.parse(stored) as string[]
        setIsComparing(ids.includes(propertyId))
      } else {
        setIsComparing(false)
      }
    }
    
    checkStatus()
    window.addEventListener('compare-updated', checkStatus)
    return () => window.removeEventListener('compare-updated', checkStatus)
  }, [propertyId])

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const stored = localStorage.getItem('nestara_compare')
    let ids: string[] = stored ? JSON.parse(stored) : []
    
    if (ids.includes(propertyId)) {
      ids = ids.filter(id => id !== propertyId)
    } else {
      if (ids.length >= 4) {
        alert("You can only compare up to 4 properties at once.")
        return
      }
      ids.push(propertyId)
    }
    
    localStorage.setItem('nestara_compare', JSON.stringify(ids))
    window.dispatchEvent(new Event('compare-updated'))
  }

  return (
    <button
      onClick={toggleCompare}
      className={`absolute top-3 right-12 z-10 p-2 rounded-full shadow-sm backdrop-blur-md transition-all ${
        isComparing 
          ? 'bg-amber-500 text-white hover:bg-amber-600' 
          : 'bg-white/90 text-zinc-600 hover:text-amber-600 hover:bg-white'
      }`}
      title={isComparing ? "Remove from compare" : "Add to compare"}
    >
      <Scale className="h-4 w-4" />
    </button>
  )
}
