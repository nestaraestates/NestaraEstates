'use client'

import { useState } from 'react'
import { updatePropertyDealStatus } from '@/app/admin/actions'
import { CheckCircle2 } from 'lucide-react'

export function DealStatusSelector({ propertyId, currentStatus }: { propertyId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus || 'AVAILABLE')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setSaving(true)
    setSaved(false)
    try {
      await updatePropertyDealStatus(propertyId, newStatus)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <select 
        value={status} 
        onChange={handleChange}
        disabled={saving}
        className="text-sm border-zinc-200 rounded-lg bg-zinc-50 py-1.5 px-3 focus:ring-blue-500 focus:border-blue-500 font-medium text-zinc-700"
      >
        <option value="AVAILABLE">Available</option>
        <option value="UNDER_NEGOTIATION">Under Negotiation</option>
        <option value="CLOSED">Closed (Sold/Rented)</option>
        <option value="DELETED">Deleted (Hidden)</option>
      </select>
      {saving && <span className="text-xs text-zinc-500 animate-pulse">Saving...</span>}
      {saved && <span className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Saved</span>}
    </div>
  )
}
