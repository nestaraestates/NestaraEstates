'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import the leaflet map to disable SSR
const DynamicMap = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />
})

export function PropertyMap({ location }: { location: string }) {
  let lat = 28.6139
  let lng = 77.2090
  let displayLocation = location

  if (location && location.includes('|')) {
    const parts = location.split('|')
    const coords = parts[0].split(',')
    lat = parseFloat(coords[0])
    lng = parseFloat(coords[1])
    displayLocation = parts[1]
  }

  return <DynamicMap location={displayLocation} lat={lat} lng={lng} />
}
