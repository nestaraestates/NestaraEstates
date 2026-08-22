'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import the leaflet map to disable SSR
const DynamicMap = dynamic(() => import('./MapClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" />
})

export function PropertyMap({ location }: { location: string }) {
  return <DynamicMap location={location} />
}
