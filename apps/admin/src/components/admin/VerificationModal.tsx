'use client'

import { useState } from 'react'
import { CheckCircle, X } from 'lucide-react'
import { approvePropertyWithChecks } from '@/app/actions'

export function VerificationModal({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [checks, setChecks] = useState({
    title_document: 'Pending',
    identity_verification: 'Pending',
    encumbrances: 'Pending',
    tax_receipts: 'Pending'
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await approvePropertyWithChecks(propertyId, checks)
    setIsSubmitting(false)
    setIsOpen(false)
  }

  const SelectOptions = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => (
    <div className="flex gap-2 mt-2">
      {['Verified', 'Pending', 'Not Provided'].map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
            value === opt 
              ? opt === 'Verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm'
              : opt === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
              : 'bg-red-100 text-red-800 border-red-200 shadow-sm'
              : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="w-full h-10 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
      >
        <CheckCircle className="h-4 w-4" /> Approve
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 bg-zinc-100 p-2 rounded-full transition-colors">
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-bold text-zinc-900 mb-2">Verification Checklist</h2>
        <p className="text-sm text-zinc-500 mb-6">Before marking this property as verified, please indicate the status of each required check. This will be shown to buyers.</p>

        <div className="space-y-6 mb-8">
          <div>
            <div className="text-sm font-bold text-zinc-700">Title Document Validated</div>
            <SelectOptions value={checks.title_document} onChange={(val) => setChecks({ ...checks, title_document: val })} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-700">Identity Verification Completed</div>
            <SelectOptions value={checks.identity_verification} onChange={(val) => setChecks({ ...checks, identity_verification: val })} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-700">No Known Encumbrances</div>
            <SelectOptions value={checks.encumbrances} onChange={(val) => setChecks({ ...checks, encumbrances: val })} />
          </div>
          <div>
            <div className="text-sm font-bold text-zinc-700">Tax Receipts Verified</div>
            <SelectOptions value={checks.tax_receipts} onChange={(val) => setChecks({ ...checks, tax_receipts: val })} />
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          {isSubmitting ? 'Saving...' : 'Save & Verify Property'}
        </button>
      </div>
    </div>
  )
}
