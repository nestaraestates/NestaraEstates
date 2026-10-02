'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { useLocation } from './LocationContext'
import { MapPin } from 'lucide-react'
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
    
    // Optionally reverse geocode here, but for now we just rely on user typing city or we can fetch city from nominatim
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Your Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-white">Save Location</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
