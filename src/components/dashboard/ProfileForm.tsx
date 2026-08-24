'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/dashboard/profile/actions'

export function ProfileForm({ profile }: { profile: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || profile.phone_number || '',
    address: profile.address || ''
  })

  const handleSave = async () => {
    setIsLoading(true)
    const result = await updateProfile({
      id: profile.id,
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address
    })
    setIsLoading(false)
    if (result.success) {
      setIsEditing(false)
    } else {
      alert("Failed to update profile: " + result.error)
    }
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Manage your personal information and contact details.</CardDescription>
        </div>
        <Button 
          variant={isEditing ? "outline" : "default"} 
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          className={!isEditing ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Read-only system fields */}
        <div className="grid md:grid-cols-2 gap-6 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800 mb-6">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Account ID</div>
            <div className="font-mono text-zinc-900 dark:text-white font-medium">{profile?.account_id || 'PENDING'}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Email</div>
            <div className="text-zinc-900 dark:text-white font-medium">{profile?.email}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Role</div>
            <div className="text-zinc-900 dark:text-white font-medium capitalize">{String(profile?.role || 'BUYER').toLowerCase()}</div>
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Verification Status</div>
            <div className={`font-medium ${profile?.verification_status === 'VERIFIED' ? 'text-emerald-600' : 'text-zinc-600 dark:text-zinc-400'}`}>
              {profile?.verification_status || 'UNVERIFIED'}
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</Label>
            {isEditing ? (
              <Input 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="John Doe"
              />
            ) : (
              <div className="text-lg text-zinc-900 dark:text-white pb-2 border-b border-transparent">{formData.full_name || <span className="text-zinc-400 italic">Not provided</span>}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone Number</Label>
            {isEditing ? (
              <Input 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+91 90000 00000"
              />
            ) : (
              <div className="text-lg text-zinc-900 dark:text-white pb-2 border-b border-transparent">{formData.phone || <span className="text-zinc-400 italic">Not provided</span>}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Saved Address</Label>
            {isEditing ? (
              <textarea 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Your full residential or office address..."
                className="w-full flex min-h-[80px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              />
            ) : (
              <div className="text-lg text-zinc-900 dark:text-white pb-2 border-b border-transparent">{formData.address || <span className="text-zinc-400 italic">Not provided</span>}</div>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            <Button onClick={handleSave} disabled={isLoading} className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
