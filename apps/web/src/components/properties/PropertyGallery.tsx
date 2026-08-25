'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PropertyGalleryProps {
  media: { url: string; is_featured: boolean }[]
  defaultImage: string
}

export function PropertyGallery({ media, defaultImage }: PropertyGalleryProps) {
  const images = media && media.length > 0 ? media.map(m => m.url) : [defaultImage]
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setIsOpen(true)
  }

  const closeLightbox = () => setIsOpen(false)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Swipe handling
  const [startX, setStartX] = useState<number | null>(null)
  const [endX, setEndX] = useState<number | null>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    setStartX(e.clientX)
    setEndX(null)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX !== null) {
      setEndX(e.clientX)
    }
  }

  const handlePointerUp = () => {
    if (startX === null || endX === null) {
      setStartX(null)
      return
    }
    const distance = startX - endX
    if (distance > 50) nextImage()
    if (distance < -50) prevImage()
    setStartX(null)
    setEndX(null)
  }

  return (
    <>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px]">
        {/* Main large image */}
        <div 
          className={`rounded-2xl overflow-hidden relative group cursor-pointer ${images.length > 1 ? 'md:col-span-3' : 'md:col-span-4'}`}
          onClick={() => openLightbox(0)}
        >
          <img 
            src={images[0]} 
            alt="Main property view" 
            className="w-full h-full object-contain bg-zinc-100 transition-transform duration-500 group-hover:scale-105" 
          />
        </div>

        {/* Small grid on the right (only if there are additional images) */}
        {images.length > 1 && (
          <div className="hidden md:flex flex-col gap-4">
            <div 
              className="h-1/2 rounded-2xl overflow-hidden relative group cursor-pointer"
              onClick={() => openLightbox(1)}
            >
              <img 
                src={images[1]} 
                alt="Property view 2" 
                className="w-full h-full object-contain bg-zinc-100 transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            
            {images.length > 2 && (
              <div 
                className="h-1/2 rounded-2xl overflow-hidden relative group cursor-pointer"
                onClick={() => openLightbox(2)}
              >
                {images.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center transition-opacity hover:bg-black/60">
                    <span className="text-white font-semibold text-lg">+{images.length - 3} Photos</span>
                  </div>
                )}
                <img 
                  src={images[2]} 
                  alt="Property view 3" 
                  className="w-full h-full object-contain bg-zinc-100 transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
            )}
            
            {images.length === 2 && (
              <div className="h-1/2 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <span className="text-sm">No more photos</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-50"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={prevImage}
              >
                <ChevronLeft className="h-10 w-10" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={nextImage}
              >
                <ChevronRight className="h-10 w-10" />
              </Button>
            </>
          )}

          <div 
            className="w-full max-w-5xl px-4 flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <img 
              src={images[currentIndex]} 
              alt={`Property image ${currentIndex + 1}`} 
              className="max-h-[85vh] max-w-full object-contain pointer-events-none"
              draggable="false"
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
