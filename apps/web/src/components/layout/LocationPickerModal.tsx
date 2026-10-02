'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { useLocation } from './LocationContext'
import { Input } from '@/components/ui/input'

// Dynamically import Map to avoid SSR issues with Leaflet
const LocationPickerClient = dynamic(
  () => import('@/components/properties/LocationPickerClient'),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-zinc-100 animate-pulse rounded-md" /> }
)

export function LocationPickerModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { location, setLocation } = useLocation()
  const [tempLat, setTempLat] = useState<number | null>(location.lat)
  const [tempLng, setTempLng] = useState<number | null>(location.lng)
  const [tempCity, setTempCity] = useState(location.city === 'Anywhere' ? '' : location.city)

  const handleLocationSelect = (lat: number, lng: number) => {
    setTempLat(lat)
    setTempLng(lng)
    
    // Optionally reverse geocode here
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || ''
        if (city) setTempCity(city)
      })
      .catch(() => {})
  }

  const handleSave = () => {
    if (tempLat && tempLng && tempCity) {
      setLocation({ city: tempCity, lat: tempLat, lng: tempLng })
    } else if (tempCity) {
      setLocation({ city: tempCity, lat: null, lng: null })
    } else {
      setLocation({ city: 'Anywhere', lat: null, lng: null })
    }
    onClose()
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 rounded-xl shadow-lg w-full max-w-[500px] flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Select Your Location</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">✕</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">City Name</label>
            <Input 
              placeholder="e.g. Bengaluru" 
              value={tempCity} 
              onChange={(e) => setTempCity(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Pinpoint on Map</label>
            <LocationPickerClient onLocationSelect={handleLocationSelect} />
          </div>
          {tempLat && tempLng && (
            <p className="text-xs text-zinc-500">
              Selected: {tempLat.toFixed(4)}, {tempLng.toFixed(4)}
            </p>
          )}
        </div>
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white">Save Location</Button>
        </div>
      </div>
    </div>
  )
}
