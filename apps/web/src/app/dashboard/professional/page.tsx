import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, IndianRupee, Clock, Star, Plus, CheckCircle2, XCircle } from 'lucide-react'
import { toggleAvailability } from './actions'
import { PortfolioUploader } from './PortfolioUploader'

export default async function ProfessionalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // Fetch professional profile
  const { data: profile } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-4">You are not registered as a Professional</h2>
        <p className="text-surface-600 mb-8">Offer your services as an Interior Designer, Worker, or Transporter to connect with property owners.</p>
        <Link href="/join-professional">
          <Button size="lg" className="bg-brand-600 hover:bg-brand-700">Become a Professional</Button>
        </Link>
      </div>
    )
  }

  // Fetch portfolio items
  const { data: portfolio } = await supabase
    .from('professional_portfolios')
    .select('*')
    .eq('professional_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Professional Hub</h1>
          <p className="text-surface-500 mt-1">Manage your {profile.category.toLowerCase()} services, portfolio, and leads.</p>
        </div>
        
        <form action={toggleAvailability.bind(null, profile.is_available)}>
          <button 
            type="submit"
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors ${
              profile.is_available 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                : 'bg-surface-200 text-surface-600 hover:bg-surface-300'
            }`}
          >
            {profile.is_available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {profile.is_available ? 'Available for Work' : 'Currently Unavailable'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-surface-200 shadow-sm">
            <CardHeader className="bg-surface-50/50 border-b border-surface-100">
              <div className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold mb-2 w-max">
                {profile.sub_category}
              </div>
              <CardTitle className="text-xl">{profile.company_name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-surface-600 text-sm">
                <Briefcase className="w-4 h-4 text-surface-400" />
                <span>{profile.years_experience} Years Experience</span>
              </div>
              <div className="flex items-center gap-3 text-surface-600 text-sm">
                <MapPin className="w-4 h-4 text-surface-400" />
                <span>Services within {profile.service_radius_km} km</span>
              </div>
              <div className="flex items-center gap-3 text-surface-600 text-sm">
                <IndianRupee className="w-4 h-4 text-surface-400" />
                <span>Base: ₹{profile.base_price_amount} ({profile.pricing_model.replace('_', ' ')})</span>
              </div>
              <div className="pt-4 border-t border-surface-100">
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-2">Verification Level</p>
                <div className="flex gap-1">
                  {[1,2,3,4].map(level => (
                    <div key={level} className={`h-2 flex-1 rounded-full ${level <= profile.verification_level ? 'bg-brand-500' : 'bg-surface-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-surface-500 mt-2 text-right">
                  {profile.verification_level === 1 ? 'Basic Profile' : 'Verified Partner'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-surface-200 shadow-sm bg-gradient-to-br from-brand-50 to-white">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-brand-500 mx-auto mb-3" />
              <h3 className="font-bold text-surface-900 mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-surface-600 mb-4">Get priority placement in search results and premium verified badges.</p>
              <Button className="w-full bg-brand-600 hover:bg-brand-700">View Plans</Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Portfolio & Leads */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="border-surface-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-surface-100 bg-surface-50/50">
              <div>
                <CardTitle>Portfolio & Past Projects</CardTitle>
                <CardDescription>Showcase your best work to win more clients.</CardDescription>
              </div>
              <PortfolioUploader />
            </CardHeader>
            <CardContent className="p-6">
              {!portfolio || portfolio.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-surface-200 rounded-xl">
                  <p className="text-surface-500">No projects uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {portfolio.map((item) => (
                    <div key={item.id} className="group relative rounded-xl overflow-hidden border border-surface-200">
                      <img src={item.media_urls[0]} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <h4 className="text-white font-bold">{item.title}</h4>
                        <p className="text-surface-300 text-xs">{item.project_type} • {item.budget_range}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-surface-200 shadow-sm">
            <CardHeader className="border-b border-surface-100">
              <CardTitle>Active Leads & Service Requests</CardTitle>
              <CardDescription>Respond to clients who need your services.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-surface-400" />
              </div>
              <h3 className="text-lg font-bold text-surface-900 mb-2">No Active Leads</h3>
              <p className="text-surface-500 max-w-md">
                You don't have any pending service requests right now. Keep your profile updated and portfolio fresh to attract more customers.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
