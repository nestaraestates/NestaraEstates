'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

export function ProfessionalsFilter({ defaultCategory, defaultSearch }: { defaultCategory: string, defaultSearch: string }) {
  const router = useRouter()
  const [search, setSearch] = useState(defaultSearch)
  const [category, setCategory] = useState(defaultCategory || 'ALL')

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'ALL') params.set('category', category)
    router.push(`/professionals?${params.toString()}`)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-6 sticky top-24">
      <div>
        <h3 className="font-medium mb-3">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Company or name..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
          />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Category</h3>
        <div className="space-y-2 flex flex-col">
          {['ALL', 'WORKER', 'DESIGNER', 'TRANSPORTER'].map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="category" 
                checked={category === cat}
                onChange={() => setCategory(cat)}
                className="accent-brand-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {cat === 'ALL' ? 'All Categories' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={applyFilters} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white">
        Apply Filters
      </Button>
    </div>
  )
}
