import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, IndianRupee, Star, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { ReviewForm } from './ReviewForm'
import { formatIndianNumber } from '@/utils/format'

export default async function ProfessionalProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: pro } = await supabase
    .from('professional_profiles')
    .select('*, profiles (full_name, avatar_url)')
    .eq('id', id)
    .single()

  if (!pro) return notFound()

  const { data: portfolio } = await supabase
    .from('professional_portfolios')
    .select('*')
    .eq('professional_id', id)
    .order('created_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('professional_reviews')
    .select('*, profiles:customer_id (full_name, avatar_url)')
    .eq('professional_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Profile Card */}
        <Card className="border-surface-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-brand-600 w-full" />
          <CardContent className="px-8 pb-8 pt-0 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-12">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                  {pro.profiles?.avatar_url ? (
                    <img src={pro.profiles.avatar_url} alt={pro.company_name} className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase className="w-10 h-10 text-surface-400" />
                  )}
                </div>
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                      {pro.sub_category}
                    </span>
                    {pro.verification_level >= 3 && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-surface-900">{pro.company_name}</h1>
                  <p className="text-surface-500">Operated by {pro.profiles?.full_name || 'Nestara Partner'}</p>
                </div>
              </div>
              
              <div className="flex gap-4 pb-2">
                <div className="text-center px-4 border-r border-surface-200">
                  <div className="text-2xl font-bold text-surface-900 flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> 
                    {pro.average_rating ? pro.average_rating : 'New'}
                  </div>
                  <p className="text-xs text-surface-500">{pro.total_reviews} Reviews</p>
                </div>
                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-surface-900">{pro.years_experience}</div>
                  <p className="text-xs text-surface-500">Years Exp.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 p-6 bg-surface-50 rounded-2xl border border-surface-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Service Radius</p>
                  <p className="text-sm text-surface-500">Up to {pro.service_radius_km} km</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Pricing Base</p>
                  <p className="text-sm text-surface-500">₹{formatIndianNumber(pro.base_price_amount)} ({pro.pricing_model.replace('_', ' ')})</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-surface-900">Availability</p>
                  <p className="text-sm text-surface-500">{pro.is_available ? 'Accepting Projects' : 'Currently Busy'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <Card className="border-surface-200 shadow-sm">
          <CardHeader>
            <CardTitle>Portfolio & Past Work</CardTitle>
          </CardHeader>
          <CardContent>
            {!portfolio || portfolio.length === 0 ? (
              <p className="text-surface-500 text-center py-8">No portfolio items uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {portfolio.map((item: any) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-surface-200">
                    <img src={item.media_urls[0]} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <h4 className="text-white font-bold text-sm">{item.title}</h4>
                      <p className="text-surface-300 text-xs">{item.project_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card className="border-surface-200 shadow-sm">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Client Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {user && user.id !== pro.id && (
              <div className="mb-8 p-6 bg-surface-50 rounded-2xl border border-surface-100">
                <h3 className="font-bold text-surface-900 mb-4">Leave a Review</h3>
                <ReviewForm professionalId={pro.id} />
              </div>
            )}

            <div className="space-y-6">
              {!reviews || reviews.length === 0 ? (
                <p className="text-surface-500 text-center py-4">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="border-b border-surface-100 pb-6 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-200 overflow-hidden">
                          {rev.profiles?.avatar_url && <img src={rev.profiles.avatar_url} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-surface-900 text-sm">{rev.profiles?.full_name || 'Anonymous Client'}</p>
                          <p className="text-xs text-surface-500">{new Date(rev.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-200'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-surface-700 text-sm mt-3 ml-13 pl-13">{rev.review_text}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
