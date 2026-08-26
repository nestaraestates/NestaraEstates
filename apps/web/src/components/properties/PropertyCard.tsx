import Link from 'next/link'
import { MapPin, BedDouble, Bath, Square, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from './FavoriteButton'
import { CompareToggleButton } from './CompareToggleButton'

interface PropertyCardProps {
  id: string
  title: string
  price: number
  location: string
  city: string
  bhk: number
  bathrooms: number
  area: number
  imageUrl: string
  isVerified: boolean
  purpose: 'BUY' | 'RENT'
  isFavorited?: boolean
}

export function PropertyCard({ id, title, price, location, city, bhk, bathrooms, area, imageUrl, isVerified, purpose, isFavorited = false }: PropertyCardProps) {
  const displayLocation = location.includes('|') ? location.split('|')[1].trim() : location.trim()
  const cleanCity = city.trim()
  const finalLocationText = displayLocation.toLowerCase() === cleanCity.toLowerCase() 
    ? displayLocation 
    : `${displayLocation}, ${cleanCity}`

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumSignificantDigits: 3,
  }).format(price)

  return (
    <Card className="group overflow-hidden rounded-2xl border-zinc-200 transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover bg-zinc-100 transition-transform duration-500 group-hover:scale-105"
        />
        
        <FavoriteButton propertyId={id} initiallyFavorited={isFavorited} />
        <CompareToggleButton propertyId={id} />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
          <span className="rounded-md bg-zinc-900/90 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md shadow-sm">
            FOR {purpose}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2 gap-2">
          <div className="text-xl font-bold text-amber-600 dark:text-amber-500">
            {formattedPrice}
            {purpose === 'RENT' && <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400"> / month</span>}
          </div>
          {isVerified ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 shrink-0">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-600 bg-zinc-100 px-2 py-1 rounded-full border border-zinc-200 shrink-0">
              <ShieldAlert className="h-3 w-3" /> Unverified
            </span>
          )}
        </div>
        <h3 className="mb-1 truncate text-lg font-semibold text-zinc-900 dark:text-white">
          {title}
        </h3>
        <div className="flex items-center gap-1 text-zinc-500 mb-4 text-sm font-medium">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{finalLocationText}</span>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <BedDouble className="h-4 w-4" />
            <span>{bhk} BHK</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-4 w-4" />
            <span>{area} sqft</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/property/${id}`} className="w-full">
          <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-500 dark:hover:bg-amber-950/30">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
