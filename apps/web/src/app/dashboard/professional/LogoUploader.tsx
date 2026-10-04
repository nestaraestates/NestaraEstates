'use client'

import { useState, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadCompanyLogo } from './actions'

export function LogoUploader({ currentLogo, companyName }: { currentLogo?: string, companyName: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('logo', file)
      await uploadCompanyLogo(formData)
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center mb-6">
      <div 
        className="w-24 h-24 rounded-2xl bg-surface-100 border-2 border-dashed border-surface-300 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-brand-500 transition-colors"
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        ) : currentLogo ? (
          <>
            <img src={currentLogo} alt={companyName} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-surface-400 group-hover:text-brand-500">
            <Camera className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Add Logo</span>
          </div>
        )}
      </div>
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  )
}
