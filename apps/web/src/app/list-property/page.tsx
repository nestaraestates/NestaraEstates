'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitProperty } from './actions'
// import dynamically instead
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LocationPicker } from '@/components/properties/LocationPicker'
import { formatIndianCurrencyShort } from '@/lib/formatPrice'

const STEPS = [
  'Property Information',
  'Pricing',
  'Photos & Media',
  'Documents (Verification)',
  'Owner Details'
]

export default function ListPropertyPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null)
  const router = useRouter()

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setErrorMsg('')
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (formData: FormData) => {
    if (currentStep === 0) {
      const village = formData.get('village') as string
      const taluk = formData.get('taluk') as string
      const city = formData.get('city') as string
      const pincode = formData.get('pincode') as string
      const state = formData.get('state') as string

      if (!village || !taluk || !city || !pincode || !state) {
        setErrorMsg('Please fill in all required location fields (Village, Taluk, City, Pincode, State).')
        return
      }
      setErrorMsg('')
    }

    // If not on the last step, just go to the next step when Enter is pressed
    if (currentStep < STEPS.length - 1) {
      handleNext()
      return
    }

    const imageFiles = formData.getAll('images') as File[]
    const hasImages = imageFiles.some(file => file && file.size > 0)

    if (!hasImages) {
      setErrorMsg('Please upload at least one property image.')
      setCurrentStep(2) // Jump back to media step
      return
    }

    setErrorMsg('')
    setIsCompressing(true)
    setIsSubmitting(true)
    
    try {
      formData.delete('images') // We will append compressed versions
      
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const options = {
            maxSizeMB: 0.3, // Target ~300kb
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          }
          const imageCompression = (await import('browser-image-compression')).default;
          const compressedFile = await imageCompression(file, options)
          formData.append('images', compressedFile, compressedFile.name)
        }
      }
    } catch (error) {
      console.error('Image compression failed:', error)
      setErrorMsg('Failed to compress images. Please try different photos.')
      setIsCompressing(false)
      setIsSubmitting(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setIsCompressing(false)

    try {
      const result = await submitProperty(formData)
      if (result?.error) {
        setErrorMsg(result.error)
        setIsSubmitting(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      // If it succeeds, the server action will call redirect(), which throws an error that Next.js catches
      // So we don't need to do anything here on success.
    } catch (err) {
      // NEXT_REDIRECT error is thrown on successful redirect.
      // We must re-throw it so Next.js handles the navigation.
      throw err;
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
        
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(new FormData(e.currentTarget))
        }} noValidate>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Property Info */}
            <div className={currentStep === 0 ? "block space-y-4" : "hidden"}>
              <div className="space-y-2">
                <Label>Property Title</Label>
                <Input name="title" placeholder="e.g. Modern 3BHK in Downtown" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <select name="type" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300">
                    <option value="APARTMENT">Apartment</option>
                    <option value="VILLA">Villa</option>
                    <option value="INDEPENDENT_HOUSE">Independent House</option>
                    <option value="PLOT">Plot / Land</option>
                    <option value="COMMERCIAL">Commercial</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <select name="purpose" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300">
                    <option value="FOR SALE">For Sale</option>
                    <option value="FOR RENT">For Rent</option>
                  </select>
                </div>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Village / Area / Landmark <span className="text-red-500">*</span></Label>
                <Input name="village" placeholder="e.g. Tavarekere" required />
              </div>
              <div className="space-y-2">
                <Label>Taluk <span className="text-red-500">*</span></Label>
                <Input name="taluk" placeholder="e.g. Hosakote" required />
              </div>
              <div className="space-y-2">
                <Label>City / District <span className="text-red-500">*</span></Label>
                <Input name="city" placeholder="e.g. Bengaluru" required />
              </div>
              <div className="space-y-2">
                <Label>Pincode <span className="text-red-500">*</span></Label>
                <Input name="pincode" placeholder="e.g. 562114" required />
              </div>
              <div className="space-y-2">
                <Label>State <span className="text-red-500">*</span></Label>
                <Input name="state" placeholder="e.g. Karnataka" required />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <Label>Exact Map Coordinates (Hidden from Public)</Label>
              <p className="text-xs text-zinc-500 mb-2">Drag the map and click to pinpoint your exact location.</p>
              <LocationPicker onLocationSelect={(lat, lng) => setCoords({lat, lng})} />
              <input type="hidden" name="coordinates" value={coords ? `${coords.lat},${coords.lng}` : ''} />
            </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>BHK</Label>
                  <Input name="bhk" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 2" />
                </div>
                <div className="space-y-2">
                  <Label>Area (Sq.ft)</Label>
                  <Input name="area" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 1200" />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input name="bathrooms" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 2" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Property Description</Label>
                <textarea name="description" className="w-full flex min-h-[100px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950" placeholder="Describe the key features, nearby amenities, and highlights of your property..."></textarea>
              </div>
            </div>

            {/* Step 2: Pricing */}
            <div className={currentStep === 1 ? "block space-y-4" : "hidden"}>
              <div className="space-y-2">
                <Label>Expected Price (₹)</Label>
                <Input 
                  name="price" 
                  type="text" 
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  placeholder="e.g. 5000000"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                />
                {priceInput && !isNaN(Number(priceInput)) && (
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-500 mt-1">
                    Formatted: {formatIndianCurrencyShort(priceInput)}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="negotiable" name="negotiable" className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500" />
                <label htmlFor="negotiable" className="text-sm font-medium leading-none">
                  Price is negotiable
                </label>
              </div>
            </div>

            {/* Step 3: Media */}
            <div className={currentStep === 2 ? "block space-y-4" : "hidden"}>
              <div className="space-y-2">
                <Label>Property Images</Label>
                <Input type="file" name="images" accept="image/*" multiple className="cursor-pointer" />
                <p className="text-xs text-zinc-500">You can select multiple photos. High quality architectural photos recommended.</p>
              </div>
            </div>

            {/* Step 4: Documents */}
            <div className={currentStep === 3 ? "block space-y-4" : "hidden"}>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 mb-1">Nestara Verification</h4>
                <p className="text-xs text-amber-700 dark:text-amber-600">Uploading documents allows us to verify your property and award the "NESTARA VERIFIED" badge, increasing buyer trust by 80%.</p>
              </div>
              <div className="space-y-2">
                <Label>Sale Deed / Title Document</Label>
                <Input type="file" name="document_deed" accept=".pdf,.doc,.docx,image/*" />
              </div>
              <div className="space-y-2">
                <Label>Latest Tax Receipt</Label>
                <Input type="file" name="document_tax" accept=".pdf,.doc,.docx,image/*" />
              </div>
            </div>

            {/* Step 5: Owner */}
            <div className={currentStep === 4 ? "block space-y-4" : "hidden"}>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="owner_name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input name="owner_phone" placeholder="+91 9876543210" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>
            
            {currentStep < STEPS.length - 1 ? (
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || isCompressing} className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900">
                {isCompressing ? 'Compressing Image...' : isSubmitting ? 'Submitting...' : 'Submit & Request Verification'}
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
