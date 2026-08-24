'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ZoomIn, ZoomOut } from 'lucide-react'

export function ImageViewer({ url, alt, children }: { url: string, alt: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(true)
    setZoom(1) // Reset zoom on open
  }

  const handleClose = () => {
    setIsOpen(false)
    setZoom(1)
  }

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4))
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5))

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer w-full h-full">
        {children}
      </div>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black/90 flex flex-col items-center justify-center p-4" onClick={handleClose}>
          <div className="absolute top-4 right-4 flex gap-3 z-[10000]">
            <button onClick={(e) => { e.stopPropagation(); zoomIn(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
              <ZoomIn className="h-6 w-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); zoomOut(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
              <ZoomOut className="h-6 w-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleClose(); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="w-full h-full flex items-center justify-center overflow-auto pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={url} 
              alt={alt} 
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease-out' }}
              className="max-w-[90vw] max-h-[90vh] object-contain origin-center cursor-move pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
