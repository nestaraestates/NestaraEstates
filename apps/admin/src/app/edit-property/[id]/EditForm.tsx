'use client'

import { useState } from 'react'
import { adminUpdatePropertyDetails } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Trash2, Upload } from 'lucide-react'

export function EditForm({ property, initialMedia }: { property: any, initialMedia: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const res = await adminUpdatePropertyDetails(property.id, formData)
    
    if (res?.error) {
      setError(res.error)
      setIsSubmitting(false)
    } else {
      router.push('/properties')
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    setUploading(true)
    setError('')
    
    try {
      const files = Array.from(e.target.files)
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `properties/${fileName}`
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file)
          
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath)
          
        // Insert into property_media
        const { data: newMedia, error: dbError } = await supabase
          .from('property_media')
          .insert({
            property_id: property.id,
            url: publicUrl,
            media_type: 'IMAGE',
            is_featured: media.length === 0 // Make first image featured
          })
          .select()
          .single()
          
        if (dbError) throw dbError
        if (newMedia) setMedia(prev => [...prev, newMedia])
      }
      
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError('Failed to upload image: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  async function deleteImage(mediaId: string, url: string) {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    try {
      // Delete from DB (The trigger bypass we created earlier might not apply to direct deletes, but standard deletes on property_media usually work if RLS allows it. Wait, Admin RLS allows DELETE on property_media now via 0007_fix_cascade_rls.sql)
      const { error: dbError } = await supabase
        .from('property_media')
        .delete()
        .eq('id', mediaId)
        
      if (dbError) throw dbError

      // Delete from storage
      const parts = url.split('/')
      const fileName = parts[parts.length - 1]
      await supabase.storage.from('media').remove([`properties/${fileName}`])
      
      setMedia(prev => prev.filter(m => m.id !== mediaId))
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError('Failed to delete image: ' + err.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* IMAGES SECTION */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 mb-4">Property Images</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {media.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-zinc-200 aspect-square">
              <img src={img.url} alt="Property" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => deleteImage(img.id, img.url)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <label className="border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer aspect-square">
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Upload Image'}</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <hr className="border-zinc-200" />

      {/* DETAILS FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
          <input 
            name="title" 
            defaultValue={property.title} 
            required 
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
          <textarea 
            name="description" 
            defaultValue={property.description || ''} 
            rows={4}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Price (₹)</label>
            <input 
              name="price" 
              type="number"
              defaultValue={property.price} 
              required 
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Status</label>
            <select 
              name="status" 
              defaultValue={property.status || 'AVAILABLE'} 
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            >
              <option value="AVAILABLE">Available</option>
              <option value="SOLD">Sold</option>
              <option value="RENTED">Rented</option>
              <option value="UNDER_NEGOTIATION">Under Negotiation</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">City</label>
            <input 
              name="city" 
              defaultValue={property.city} 
              required 
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Location Area</label>
            <input 
              name="location" 
              defaultValue={property.location} 
              required 
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
