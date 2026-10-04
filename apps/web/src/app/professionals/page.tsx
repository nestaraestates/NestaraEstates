import { createStaticClient } from '@/utils/supabase/static'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, Star, ShieldCheck, Camera, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { ProfessionalsFilter } from './ProfessionalsFilter'

export const metadata = {
  title: 'Hire Professionals - Nestara Estates',
  description: 'Find trusted builders, designers, and transporters.',
}

export default async function ProfessionalsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : ''
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''

  const supabase = createStaticClient()

  let query = supabase
    .from('professional_profiles')
    .select(`
      *,
      profiles (full_name, avatar_url),
      professional_portfolios (media_urls)
    `)
    .eq('is_available', true)

  if (category && category !== 'ALL') {
    query = query.eq('category', category)
  }
  if (search) {
    query = query.ilike('company_name', `%${search}%`)
  }

  const { data: professionals, error } = await query

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 shrink-0">
          <ProfessionalsFilter defaultCategory={category} defaultSearch={search} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Global Service Directory</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-2">
              Find verified experts to design, build, and transport.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">Error loading professionals.</div>
          )}

          {!professionals || professionals.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
              <p className="text-zinc-500">No professionals found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map((pro: any) => {
                const name = pro.company_name || pro.profiles?.full_name || 'Unknown'
                const firstMedia = (pro.professional_portfolios && pro.professional_portfolios.length > 0 && pro.professional_portfolios[0].media_urls.length > 0) 
                  ? pro.professional_portfolios[0].media_urls[0] 
                  : null

                return (
                  <Card key={pro.id} className="overflow-hidden hover:shadow-lg transition-all dark:bg-zinc-950 dark:border-zinc-800">
                    <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 relative">
                      {firstMedia ? (
                        <img src={firstMedia} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                          <Camera className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs">No Portfolio</span>
                        </div>
                      )}
                      {pro.verification_level > 2 && (
                        <div className="absolute top-3 right-3 bg-brand-500 text-white p-1.5 rounded-full shadow-md">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span  className="mb-2 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800/50">
                            {pro.category} {pro.sub_category ? `- ${pro.sub_category}` : ''}
                          </span>
                          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-zinc-400" />
                          <span>{pro.years_experience} Years Experience</span>
                        </div>
                        {pro.base_price_amount && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                              ₹{pro.base_price_amount.toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs">
                              {pro.pricing_model === 'PER_HOUR' ? '/ hr' : pro.pricing_model === 'PER_SQFT' ? '/ sq.ft' : ''}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white" >
                        <Link href={`/professionals/${pro.id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
