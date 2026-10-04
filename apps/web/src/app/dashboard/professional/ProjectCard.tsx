'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deletePortfolioItem } from './actions'

export function ProjectCard({ item }: { item: any }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this project?')) return
    setIsDeleting(true)
    try {
      await deletePortfolioItem(item.id)
    } catch (err) {
      console.error(err)
      setIsDeleting(false)
    }
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-surface-200">
      <img 
        src={item.media_urls?.[0]} 
        alt={item.title} 
        className={`w-full h-48 object-cover transition-all duration-300 ${isDeleting ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`} 
      />
      
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
        <h4 className="text-white font-bold">{item.title}</h4>
        <p className="text-surface-300 text-xs">{item.project_type} • {item.budget_range}</p>
      </div>
    </div>
  )
}
