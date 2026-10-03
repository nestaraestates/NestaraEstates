'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { uploadPortfolioItem } from './actions'

export function PortfolioUploader() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)
    setError('')
    
    try {
      const formData = new FormData(e.currentTarget)
      const res = await uploadPortfolioItem(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)} className="bg-brand-600 hover:bg-brand-700">
        <Plus className="w-4 h-4 mr-1" /> Add Project
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-900">Add to Portfolio</h2>
              <p className="text-sm text-zinc-500">Showcase a completed project or 3D render.</p>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {error && <div className="p-2 text-sm text-red-600 bg-red-50 rounded">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input id="title" name="title" required placeholder="e.g. Modern Villa Interior" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project_type">Project Type</Label>
                <Input id="project_type" name="project_type" required placeholder="e.g. Residential 3BHK" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <Input id="budget_range" name="budget_range" required placeholder="e.g. ₹10L - ₹15L" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">High-Quality Photo/Render</Label>
                <Input id="image" name="image" type="file" accept="image/*" required />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading} className="bg-brand-600 hover:bg-brand-700">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ImageIcon className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Uploading...' : 'Upload Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
