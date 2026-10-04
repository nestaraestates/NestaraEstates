'use client'

import { useState } from 'react'
import { Trash2, Loader2, Edit, X } from 'lucide-react'
import { deletePortfolioItem, updatePortfolioItem } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ProjectCard({ item }: { item: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

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

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    
    try {
      const formData = new FormData(e.currentTarget)
      const files = formData.getAll('images') as File[]
      if (files.length > 3) {
        setError('You can only upload up to 3 images per project.')
        setIsSaving(false)
        return
      }
      formData.append('id', item.id)
      const res = await updatePortfolioItem(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsEditing(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="group relative rounded-xl overflow-hidden border border-surface-200">
        <img 
          src={item.media_urls?.[0]} 
          alt={item.title} 
          className={`w-full h-48 object-cover transition-all duration-300 ${isDeleting ? 'opacity-50 grayscale' : 'group-hover:scale-105'}`} 
        />
        
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            disabled={isDeleting}
            className="bg-white/90 p-2 rounded-full shadow-md text-brand-600 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-white/90 p-2 rounded-full shadow-md text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 pointer-events-none">
          <h4 className="text-white font-bold">{item.title}</h4>
          <p className="text-surface-300 text-xs">{item.project_type} • {item.budget_range}</p>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Edit Project</h2>
              <p className="text-sm text-zinc-500">Update project details.</p>
            </div>
            
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              {error && <div className="p-2 text-sm text-red-600 bg-red-50 rounded">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" defaultValue={item.title} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type</Label>
                <Input id="project_type" name="project_type" defaultValue={item.project_type} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <Input id="budget_range" name="budget_range" defaultValue={item.budget_range} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Update Photos (Optional)</Label>
                <Input id="images" name="images" type="file" accept="image/*" multiple max="3" />
                <p className="text-xs text-zinc-500">Leave empty to keep existing photos, or select up to 3 new photos to replace them.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-brand-600 hover:bg-brand-700">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
