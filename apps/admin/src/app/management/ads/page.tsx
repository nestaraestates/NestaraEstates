import { createClient } from '@/utils/supabase/server'
import AdSlotClient from './AdSlotClient'
import { Megaphone, Smartphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MobileAdsPage() {
  const supabase = await createClient()

  const { data: ads } = await supabase
    .from('mobile_ads')
    .select('*')
    .order('slot_number', { ascending: true })

  const adSlots = [1, 2, 3, 4].map(slot_number => {
    return ads?.find(ad => ad.slot_number === slot_number) || { slot_number, empty: true }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto pb-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
          <Smartphone className="h-8 w-8 text-pink-600" />
          Manage Ad Slots
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">Manage the 4 promotional slots in the mobile app home screen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adSlots.map((slot) => (
          <AdSlotClient key={slot.slot_number} slot={slot} />
        ))}
      </div>
    </div>
  )
}
