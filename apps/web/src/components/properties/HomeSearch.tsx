'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Home } from 'lucide-react'

export function HomeSearch() {
  const router = useRouter()
  const [purpose, setPurpose] = useState('buy')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    
    // Redirect to either /buy or /rent based on the toggle
    router.push(`/${purpose}?${params.toString()}`)
  }

    return (
    <div className="w-full bg-white p-2">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
        <div className="flex bg-surface-100 p-1 rounded-lg w-full sm:w-auto shrink-0">
          <button 
            type="button"
            onClick={() => setPurpose('buy')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${purpose === 'buy' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
          >
            Buy
          </button>
          <button 
            type="button"
            onClick={() => setPurpose('rent')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${purpose === 'rent' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}
          >
            Rent
          </button>
        </div>
        
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, neighborhood, or property type..." 
            className="w-full pl-9 h-10 bg-white border-surface-200 focus-visible:ring-brand-500 rounded-lg"
          />
        </div>
        
        <Button type="submit" className="w-full sm:w-auto h-10 px-6 bg-brand-500 hover:bg-brand-600 text-white rounded-lg shrink-0">
          Search
        </Button>
      </form>
    </div>
  )
}
