import { ShieldCheck, CheckCircle2, FileSearch, Home, UserCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function VerificationPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-16 w-16" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Nestara Verified Properties
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Trust is our foundation. We rigorously verify properties so you can buy, rent, or invest with absolute peace of mind.
        </p>
      </div>

      {/* The 4-Step Process */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our 4-Step Verification Process</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-amber-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <FileSearch className="h-10 w-10 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">1. Title & Legal Check</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">We verify the sale deed, property tax receipts, and ensure the title is legally clear with no pending disputes.</p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <UserCheck className="h-10 w-10 text-emerald-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">2. Identity Verification</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">We cross-check the owner's government-issued ID against the property documents to prevent fraud.</p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <Home className="h-10 w-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">3. Physical Inspection</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">Our on-ground agents visit the property to confirm it physically exists and matches the listed photographs.</p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-purple-900/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
            <CheckCircle2 className="h-10 w-10 text-purple-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">4. Encumbrance Check</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">We ensure there are no hidden mortgages, loans, or third-party claims on the property before listing it.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-zinc-900 dark:bg-zinc-900 text-white rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-zinc-800">
        <div className="max-w-xl">
          <h2 className="text-3xl font-bold mb-4 text-white">Sell Faster with the Verified Badge</h2>
          <p className="text-zinc-400 mb-0 text-lg">
            Properties with the "Nestara Verified" badge get 80% more leads and close deals 3x faster. List your property today and our team will begin the verification process.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link href="/list-property">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-14 px-8 text-lg">
              List & Verify Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
