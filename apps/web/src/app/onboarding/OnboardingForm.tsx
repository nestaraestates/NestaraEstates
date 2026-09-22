'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { completeOnboarding } from './actions'
import imageCompression from 'browser-image-compression'

export function OnboardingForm({ initialName, needsPassword }: { initialName: string, needsPassword?: boolean }) {
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    if (needsPassword && password !== confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    setIsSubmitting(true)

    const avatarFile = formData.get('avatar') as File
    if (avatarFile && avatarFile.size > 0) {
      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        }
        const compressedFile = await imageCompression(avatarFile, options)
        formData.set('avatar', compressedFile, compressedFile.name || 'avatar.jpg')
      } catch (err) {
        console.error('Error compressing image:', err)
      }
    }

    const res = await completeOnboarding(formData)
    if (res?.error) {
      setError(res.error)
    }
    setIsSubmitting(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
          {error}
        </div>
      )}

      <div className="space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Basic Details</h3>
          <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Profile Picture (Optional)</Label>
              <Input id="avatar" name="avatar" type="file" accept="image/*" className="bg-white dark:bg-zinc-900 cursor-pointer" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input id="full_name" name="full_name" defaultValue={initialName} required className="bg-white dark:bg-zinc-900" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number *</Label>
              <Input id="phone_number" name="phone_number" type="tel" required className="bg-white dark:bg-zinc-900" placeholder="+91 9876543210" defaultValue="+91 " />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input type="checkbox" id="whatsapp_enabled" name="whatsapp_enabled" value="true" className="h-4 w-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-600" />
              <Label htmlFor="whatsapp_enabled" className="text-sm font-normal">This number is available on WhatsApp</Label>
            </div>
          </div>
        </div>

        {/* Location & Intent */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Location & Intent</h3>
          <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="space-y-2">
              <Label htmlFor="address">City / Address *</Label>
              <Input id="address" name="address" required className="bg-white dark:bg-zinc-900" placeholder="Bengaluru, Karnataka" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_intent">Primary Intent</Label>
              <select id="primary_intent" name="primary_intent" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300">
                <option value="BUY">Looking to Buy</option>
                <option value="RENT">Looking to Rent</option>
                <option value="SELL">Looking to Sell / List</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_cities">Preferred Cities (Karnataka)</Label>
              <Input id="preferred_cities" name="preferred_cities" className="bg-white dark:bg-zinc-900" placeholder="e.g. Bengaluru, Mysuru, Mangaluru" />
            </div>
          </div>
        </div>

        {/* Optional Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Professional & Extra (Optional)</h3>
          <div className="space-y-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company / Agency Name</Label>
              <Input id="company_name" name="company_name" className="bg-white dark:bg-zinc-900" placeholder="e.g. Nestara Realty" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea id="bio" name="bio" rows={3} className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300" placeholder="Tell us what you are looking for..." />
            </div>
          </div>
        </div>

        {needsPassword && (
          <div className="space-y-4 rounded-xl border border-amber-200 p-4 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
            <div>
              <Label htmlFor="password">Create Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-white dark:bg-zinc-900 mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            
            <div>
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input 
                id="confirm_password" 
                type="password" 
                required 
                className="bg-white dark:bg-zinc-900 mt-2" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">Since you signed up with Google, please create a password for email login.</p>
          </div>
        )}
      </div>

      <Button disabled={isSubmitting} type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-base font-semibold mt-8">
        {isSubmitting ? 'Saving...' : 'Save & Continue'}
      </Button>
    </form>
  )
}
