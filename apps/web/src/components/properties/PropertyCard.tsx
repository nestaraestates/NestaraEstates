import Link from 'next/link'
import { MapPin, BedDouble, Bath, Square, ShieldCheck, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from './FavoriteButton'
import { CompareToggleButton } from './CompareToggleButton'
import { formatIndianCurrencyShort } from '@/lib/formatPrice'

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

  const formattedPrice = formatIndianCurrencyShort(price)

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:border-surface-800 dark:bg-surface-900 relative">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Actions Overlay */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <FavoriteButton propertyId={id} initiallyFavorited={isFavorited} />
          <CompareToggleButton propertyId={id} />
        </div>
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
          <span className="rounded-full bg-surface-900/90 px-3 py-1 text-[11px] font-bold tracking-wider text-white backdrop-blur-md shadow-sm">
            FOR {purpose}
          </span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="text-2xl font-black text-brand-600 dark:text-brand-400 tracking-tight">
            {formattedPrice}
            {purpose === 'RENT' && <span className="text-sm font-medium text-surface-500 dark:text-surface-400"> / mo</span>}
          </div>
          {isVerified ? (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-brand-700 bg-brand-50 px-2 py-1 rounded-full border border-brand-200 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-surface-600 bg-surface-100 px-2 py-1 rounded-full border border-surface-200 shrink-0">
              <ShieldAlert className="h-3.5 w-3.5" /> Unverified
            </span>
          )}
        </div>
        
        <h3 className="mb-2 line-clamp-1 text-lg font-bold text-surface-900 dark:text-white leading-tight">
          {title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-surface-500 mb-5 text-sm font-medium">
          <MapPin className="h-4 w-4 shrink-0 text-brand-500" />
          <span className="truncate">{finalLocationText}</span>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-surface-100 pt-4 text-xs font-semibold text-surface-600 dark:border-surface-800 dark:text-surface-400">
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-50 py-2 dark:bg-surface-800/50">
            <BedDouble className="h-4 w-4 text-brand-500" />
            <span>{bhk} BHK</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-50 py-2 dark:bg-surface-800/50">
            <Bath className="h-4 w-4 text-brand-500" />
            <span>{bathrooms} Bath</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-surface-50 py-2 dark:bg-surface-800/50">
            <Square className="h-4 w-4 text-brand-500" />
            <span>{area} sqft</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0">
        <Link href={`/property/${id}`} className="w-full">
          <Button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold h-11 text-sm rounded-xl transition-colors shadow-sm dark:bg-brand-500 dark:hover:bg-brand-600">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
