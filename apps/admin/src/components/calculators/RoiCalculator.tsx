'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function RoiCalculator({ defaultPrice = 5000000 }: { defaultPrice?: number }) {
  const [propertyPrice, setPropertyPrice] = useState<number | ''>(defaultPrice)
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('')
  const [maintenance, setMaintenance] = useState<number | ''>('')

  const pPrice = Number(propertyPrice) || 0
  const mRent = Number(monthlyRent) || 0
  const maint = Number(maintenance) || 0

  const annualRent = mRent * 12
  const annualMaintenance = maint * 12
  const netAnnualIncome = annualRent - annualMaintenance
  const roi = pPrice > 0 ? (netAnnualIncome / pPrice) * 100 : 0

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl">ROI & Rental Yield Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Price (₹)</Label>
              <Input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Expected Monthly Rent (₹)</Label>
              <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Monthly Maintenance (₹)</Label>
              <Input type="number" value={maintenance} onChange={(e) => setMaintenance(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-6 dark:bg-zinc-900/50 flex flex-col justify-center text-center">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Estimated Gross Rental Yield</p>
            <p className="text-4xl font-bold text-amber-600 dark:text-amber-500 mb-6">{roi.toFixed(2)}%</p>
            
            <div className="flex justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Net Annual Income</span>
              <span className="font-semibold">{formatCurrency(netAnnualIncome)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
