'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { addAd, toggleAdStatus, deleteAd } from './actions'
import { Trash2, Link as LinkIcon, Loader2, Upload } from 'lucide-react'

export default function AdSlotClient({ slot }: { slot: any }) {
  const [isUploading, setIsUploading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  
  const handleUpload = async () => {
    if (!file) return alert('Please provide an ad image')
    
    setIsUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `slot_${slot.slot_number}/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('ads')
        .upload(filePath, file)
        
      if (uploadError) throw uploadError
      
      const { data } = supabase.storage.from('ads').getPublicUrl(filePath)
      
      await addAd(slot.slot_number, data.publicUrl, redirectUrl)
      
      setFile(null)
      setRedirectUrl('')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleToggle = async (checked: boolean) => {
    await toggleAdStatus(slot.id, checked)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this ad?')) return
    await deleteAd(slot.id)
  }

  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full">
      <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Slot {slot.slot_number}</CardTitle>
          {!slot.empty && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-500">Active</span>
              
              <button
                onClick={() => handleToggle(!slot.is_active)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${slot.is_active ? 'bg-blue-600' : 'bg-zinc-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${slot.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>

            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 flex-1 flex flex-col justify-center">
        {slot.empty ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ad Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <Label>Redirect URL</Label>
              <Input 
                placeholder="https://..." 
                value={redirectUrl} 
                onChange={(e) => setRedirectUrl(e.target.value)} 
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={isUploading || !file}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {isUploading ? 'Uploading...' : 'Add Ad'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slot.image_url} alt={`Ad Slot ${slot.slot_number}`} className="object-cover w-full h-full" />
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100 break-all">
              <LinkIcon className="h-4 w-4 flex-shrink-0" />
              {slot.redirect_url ? <a href={slot.redirect_url} target="_blank" rel="noreferrer" className="hover:underline line-clamp-1">{slot.redirect_url}</a> : <span className="italic text-zinc-400">No redirect link provided</span>}
            </div>
            <div className="mt-auto pt-4">
              <Button variant="destructive" className="w-full" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Ad
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
