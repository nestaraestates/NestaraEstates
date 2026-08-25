'use client'

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { LocateFixed } from 'lucide-react'

function RecenterMap({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 15)
  }, [lat, lng, map])
  return null
}

function MapEvents({ setPosition, onLocationSelect }: { setPosition: (pos: [number, number]) => void, onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function LocationPickerClient({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]) // Default Delhi
  const [isLocating, setIsLocating] = useState(false)

  useEffect(() => {
    // Fix leaflet marker icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  const detectLocation = (e?: React.MouseEvent) => {
    if (e) e.preventDefault() // prevent form submission
    
    if (!window.isSecureContext) {
      alert("Browser security blocks location detection on non-HTTPS connections. Please drag the pin manually or test on localhost.")
      return
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setPosition([latitude, longitude])
        onLocationSelect(latitude, longitude)
        setIsLocating(false)
      },
      (err) => {
        console.error("Location detection failed:", err)
        setIsLocating(false)
        let msg = "Could not detect location. Please ensure location permissions are granted."
        if (err.code === 1) msg = "Location permission was denied."
        if (err.code === 2) msg = "Location information is unavailable right now."
        if (err.code === 3) msg = "The request to get user location timed out."
        alert(msg)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    )
  }


  return (
    <div className="space-y-3">
      <Button 
        type="button" 
        variant="outline" 
        onClick={detectLocation}
        disabled={isLocating}
        className="w-full sm:w-auto"
      >
        <LocateFixed className={`mr-2 h-4 w-4 ${isLocating ? 'animate-pulse' : ''}`} />
        {isLocating ? 'Detecting...' : 'Detect My Location'}
      </Button>
      <div className="relative h-[300px] w-full rounded-md overflow-hidden z-0 border border-zinc-200 dark:border-zinc-800">
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="h-full w-full relative z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapEvents setPosition={setPosition} onLocationSelect={onLocationSelect} />
          <RecenterMap lat={position[0]} lng={position[1]} />
        </MapContainer>
      </div>
    </div>
  )
}
