'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useLocation } from '@/components/layout/LocationContext'

export function PropertyFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { location } = useLocation()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [bhk, setBhk] = useState(searchParams.get('bhk') || '')
  const [radius, setRadius] = useState(searchParams.get('radius') || '')
  const [isLocating, setIsLocating] = useState(false)

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (bhk) params.set('bhk', bhk)
    
    if (radius) {
      if (location.lat && location.lng) {
        params.set('lat', location.lat.toString());
        params.set('lng', location.lng.toString());
        params.set('radius', radius);
        router.push(`?${params.toString()}`);
      } else {
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            params.set('lat', position.coords.latitude.toString());
            params.set('lng', position.coords.longitude.toString());
            params.set('radius', radius);
            setIsLocating(false);
            router.push(`?${params.toString()}`);
          },
          (error) => {
            setIsLocating(false);
            alert('Could not get your location. Please select it from the navbar or enable location permissions.');
          }
        );
      }
      return;
    }
    
    router.push(`?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setBhk('')
    setRadius('')
    router.push('?')
  }

  return (
    <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-8">
      <form onSubmit={handleApplyFilters} className="flex flex-col md:flex-row gap-4 items-end">
        
        <div className="w-full md:w-1/3 space-y-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Location or Title</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search city, area..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full md:w-1/6 space-y-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Min Price</label>
          <Input 
            type="number" 
            placeholder="₹ 0" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/6 space-y-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Max Price</label>
          <Input 
            type="number" 
            placeholder="Any" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/6 space-y-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase">BHK</label>
          <select 
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
            value={bhk}
            onChange={(e) => setBhk(e.target.value)}
          >
            <option value="">Any</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>

        <div className="w-full md:w-1/6 space-y-1">
          <label className="text-xs font-semibold text-zinc-500 uppercase">Search Radius</label>
          <select 
            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
          >
            <option value="">Anywhere</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

        <div className="w-full md:w-auto flex gap-2">
          <Button type="button" variant="outline" onClick={handleClear} className="flex-1 md:flex-none">
            Clear
          </Button>
          <Button type="submit" className="flex-1 md:flex-none bg-brand-500 hover:bg-brand-600 text-white">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {isLocating ? 'Locating...' : 'Filter'}
          </Button>
        </div>

      </form>
    </div>
  )
}
