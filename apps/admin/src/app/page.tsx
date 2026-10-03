import { createClient } from '@/utils/supabase/server'
import { Megaphone, Users, User, Building, ShieldCheck, ShieldAlert, ArrowRight, MessageSquare, Activity, MapPin, Search, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: propsCount },
    { count: verifiedCount },
    { count: unverifiedCount },
    { data: recentUnverified }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_verified', true),
    supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_verified', false),
    supabase.from('properties')
      .select('id, title, city, created_at, profiles(full_name)')
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-2 font-medium">Welcome to the Nestara OS Command Center.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-900 mb-1">{usersCount || 0}</div>
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-500">Total Users</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-zinc-50 flex items-center justify-center">
                <Building className="h-6 w-6 text-zinc-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-900 mb-1">{propsCount || 0}</div>
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-500">Total Properties</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-900 mb-1">{verifiedCount || 0}</div>
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-500">Verified Properties</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
                <ShieldAlert className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-black text-zinc-900 mb-1">{unverifiedCount || 0}</div>
              <div className="text-xs uppercase tracking-wider font-bold text-zinc-500">Pending Verification</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-sm border-zinc-200">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Link href="/properties" className="block">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 group-hover:bg-indigo-200 transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-zinc-800 group-hover:text-indigo-900">Verify Properties</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
              
              
              <Link href="/management/announcements" className="block">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-purple-200 hover:bg-purple-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600 group-hover:bg-purple-200 transition-colors">
                      <Megaphone className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-zinc-800 group-hover:text-purple-900">Send Announcement</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/management/audit" className="block">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-orange-200 hover:bg-orange-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600 group-hover:bg-orange-200 transition-colors">
                      <Activity className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-zinc-800 group-hover:text-orange-900">View Audit Logs</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/management" className="block">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-blue-200 hover:bg-blue-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600 group-hover:bg-blue-200 transition-colors">
                      <Users className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-zinc-800 group-hover:text-blue-900">Manage Users</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/crm/leads" className="block">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 group-hover:bg-emerald-200 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-zinc-800 group-hover:text-emerald-900">View CRM Leads</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link href="/management/ads" className="block">
                <div className="group flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-pink-200 hover:bg-pink-50/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg text-pink-600 group-hover:bg-pink-200 transition-colors">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-zinc-800 group-hover:text-pink-900">Manage Ad Slots</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-pink-600 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Action Needed: Pending Verifications */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-zinc-200 h-full flex flex-col">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-500" /> Requires Attention
                </CardTitle>
                <CardDescription>Properties waiting for admin verification</CardDescription>
              </div>
              <Link href="/properties">
                <Button variant="outline" size="sm" className="hidden sm:flex">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              {recentUnverified && recentUnverified.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentUnverified.map((prop) => (
                    <div key={prop.id} className="p-4 sm:px-6 hover:bg-zinc-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-zinc-900 line-clamp-1">{prop.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {prop.city}</span>
                          <span className="flex items-center gap-1"><User className="h-3 w-3" /> {Array.isArray(prop.profiles) ? prop.profiles[0]?.full_name : (prop.profiles as any)?.full_name || 'Unknown'}</span>
                        </div>
                      </div>
                      <Link href={`/properties/${prop.id}`} className="shrink-0">
                        <Button variant="secondary" size="sm" className="w-full sm:w-auto">Review Listing</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-500">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <ShieldCheck className="h-6 w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-zinc-900 font-medium mb-1">All caught up!</h3>
                  <p className="text-sm">There are no properties pending verification.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
