'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const DynamicPicker = dynamic(() => import('./LocationPickerClient'), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full rounded-md" />
})

export function LocationPicker({ 
  onLocationSelect 
}: { 
  onLocationSelect: (lat: number, lng: number) => void 
}) {
  return <DynamicPicker onLocationSelect={onLocationSelect} />
}
