'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { completeOnboarding } from './actions'

export function OnboardingForm({ initialName, needsPassword }: { initialName: string, needsPassword?: boolean }) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    const res = await completeOnboarding(formData)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/50">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" name="full_name" defaultValue={initialName} required className="bg-white dark:bg-zinc-900" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input id="phone_number" name="phone_number" type="tel" required className="bg-white dark:bg-zinc-900" placeholder="+1234567890" />
        </div>

        {needsPassword && (
          <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <Input id="password" name="password" type="password" required className="bg-white dark:bg-zinc-900" />
            <p className="text-xs text-zinc-500">Since you signed up with Google, please create a password for email login.</p>
          </div>
        )}

        <div className="space-y-3">
          <Label>I am a...</Label>
          <RadioGroup defaultValue="USER" name="role" className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <RadioGroupItem value="USER" id="role-user" />
              <Label htmlFor="role-user" className="flex-1 cursor-pointer font-medium">
                Buyer / Renter
                <span className="block font-normal text-zinc-500 text-sm mt-1">
                  I want to search for properties
                </span>
              </Label>
            </div>
            <div className="flex items-center space-x-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              <RadioGroupItem value="DEALER" id="role-dealer" />
              <Label htmlFor="role-dealer" className="flex-1 cursor-pointer font-medium">
                Property Owner / Dealer
                <span className="block font-normal text-zinc-500 text-sm mt-1">
                  I want to list properties for sale or rent
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
        Complete Profile
      </Button>
    </form>
  )
}
