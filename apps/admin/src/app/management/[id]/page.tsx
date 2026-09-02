import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Phone, Calendar, Shield, CheckCircle } from 'lucide-react'
import { promoteToAdmin, demoteFromAdmin } from '../actions'
import { isSuperAdmin } from '@/lib/admin'

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get current admin user for permissions
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isSuper = isSuperAdmin(currentUser?.email)

  // Fetch target user profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Fetch some basic stats (optional, just counting properties)
  const { count: propertyCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/management">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{profile.full_name || 'Unknown User'}</h1>
          <p className="text-zinc-500 font-mono text-sm">{profile.custom_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
              <CardDescription>Personal and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-zinc-400" />
                <span className="font-medium w-24">Name:</span>
                <span className="text-zinc-600">{profile.full_name || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="font-medium w-24">Email:</span>
                <span className="text-zinc-600">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-zinc-400" />
                <span className="font-medium w-24">Phone:</span>
                <span className="text-zinc-600">{profile.phone_number || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="font-medium w-24">Joined:</span>
                <span className="text-zinc-600">{new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-zinc-400" />
                <span className="font-medium w-24">Verification:</span>
                <span className="text-zinc-600 capitalize">{profile.verification_status?.toLowerCase()}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-center">
                  <div className="text-2xl font-bold text-zinc-900">{propertyCount || 0}</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-1">Properties Listed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permissions & Access</CardTitle>
              <CardDescription>Manage user roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-sm font-medium mb-2">Current Role</div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${profile.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  {profile.role || 'user'}
                </span>
              </div>

              {isSuper && (
                <div className="pt-4 border-t border-zinc-100">
                  <div className="text-sm font-medium mb-3">Admin Access</div>
                  {profile.role !== 'admin' ? (
                    <form action={async () => {
                      'use server'
                      await promoteToAdmin(profile.id)
                    }}>
                      <Button type="submit" className="w-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200">
                        Promote to Admin
                      </Button>
                    </form>
                  ) : (
                    <form action={async () => {
                      'use server'
                      await demoteFromAdmin(profile.id)
                    }}>
                      <Button type="submit" variant="outline" className="w-full text-zinc-700">
                        Remove Admin Access
                      </Button>
                    </form>
                  )}
                  <p className="text-xs text-zinc-500 mt-2">
                    Admins have access to the dashboard to manage properties, leads, and view users.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-100">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                Suspend Account
              </Button>
              <Button variant="destructive" className="w-full">
                Ban User Permanently
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
