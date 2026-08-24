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
    <div className="mx-auto max-w-4xl">
      {/* Tabs */}
      <div className="flex gap-2 mb-2 ml-4">
        <button 
          onClick={() => setPurpose('buy')}
          className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
            purpose === 'buy' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
          }`}
        >
          Buy
        </button>
        <button 
          onClick={() => setPurpose('rent')}
          className={`px-6 py-2 rounded-t-lg font-semibold text-sm transition-colors ${
            purpose === 'rent' ? 'bg-amber-500 text-white' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
          }`}
        >
          Rent
        </button>
      </div>

      {/* Search Bar Container */}
      <div className="rounded-2xl rounded-tl-none bg-white/10 p-2 backdrop-blur-md shadow-2xl">
        <form onSubmit={handleSearch} className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-inner sm:flex-row dark:bg-zinc-950">
          
          <div className="flex flex-1 items-center gap-2 px-3 py-2">
            <MapPin className="h-5 w-5 text-zinc-400" />
            <Input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Location, Landmark, or City..." 
              className="border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
            />
          </div>

          <Button type="submit" size="lg" className="h-12 w-full bg-amber-500 text-white hover:bg-amber-600 sm:w-auto px-8">
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
        </form>
      </div>
    </div>
  )
}
