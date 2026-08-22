'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const STEPS = [
  'Property Information',
  'Pricing',
  'Photos & Media',
  'Documents (Verification)',
  'Owner Details'
]

export default function ListPropertyPage() {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">List Your Property</h1>
        <p className="text-zinc-500 mt-2">Complete the steps below to list your property and request verification.</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-zinc-200 dark:bg-zinc-800">
          <div 
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-500"
          ></div>
        </div>
        <div className="flex justify-between text-xs font-medium text-zinc-500">
          {STEPS.map((step, index) => (
            <span key={step} className={index <= currentStep ? "text-amber-600 dark:text-amber-500" : ""}>
              {index + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle>{STEPS[currentStep]}</CardTitle>
          <CardDescription>Please provide accurate details to ensure a smooth verification process.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Property Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Input placeholder="e.g. Apartment, Villa" />
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <select className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300">
                    <option>For Sale</option>
                    <option>For Rent</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location / City</Label>
                <Input placeholder="City, Area, Landmark" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>BHK</Label>
                  <Input type="number" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label>Area (Sq.ft)</Label>
                  <Input type="number" placeholder="1200" />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input type="number" placeholder="2" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Expected Price (₹)</Label>
                <Input type="number" placeholder="50,00,000" />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="negotiable" className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="negotiable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Price is negotiable
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Media */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-12 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <p className="text-sm text-zinc-500">Click to upload photos (Max 10)</p>
                <p className="text-xs text-zinc-400 mt-2">High quality architectural photos recommended</p>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">Nestara Verification</h4>
                <p className="text-xs text-amber-700 dark:text-amber-600">Uploading documents allows us to verify your property and award the "NESTARA VERIFIED" badge, increasing buyer trust by 80%.</p>
              </div>
              <div className="space-y-2">
                <Label>Sale Deed / Title Document</Label>
                <Input type="file" />
              </div>
              <div className="space-y-2">
                <Label>Latest Tax Receipt</Label>
                <Input type="file" />
              </div>
            </div>
          )}

          {/* Step 5: Owner */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input placeholder="+91 9876543210" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="bg-amber-500 hover:bg-amber-600 text-white">
              Next Step
            </Button>
          ) : (
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900">
              Submit & Request Verification
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
