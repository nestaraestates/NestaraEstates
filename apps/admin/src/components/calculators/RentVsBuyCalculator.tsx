'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatIndianCurrencyShort } from '@/lib/formatPrice'

export function RentVsBuyCalculator({ defaultPrice = 5000000 }: { defaultPrice?: number }) {
  const [propertyPrice, setPropertyPrice] = useState<number | ''>(defaultPrice)
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('')
  const [years, setYears] = useState<number | ''>('')

  // Simplified calculation for demonstration
  const pPrice = Number(propertyPrice) || 0
  const mRent = Number(monthlyRent) || 0
  const y = Number(years) || 0

  const totalRentPaid = mRent * 12 * y
  const estimatedAppreciation = pPrice * Math.pow(1.05, y) // 5% annual appreciation
  const buyingCost = pPrice * 1.08 // Include 8% for registration/taxes

  const isBuyingBetter = estimatedAppreciation - buyingCost > -totalRentPaid

  const formatCurrency = (val: number) => 
    formatIndianCurrencyShort(val)

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Rent vs Buy Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Price (₹)</Label>
              <Input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Comparable Monthly Rent (₹)</Label>
              <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Time Horizon (Years)</Label>
              <Input type="number" value={years} onChange={(e) => setYears(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            </div>
          </div>

          <div className="rounded-xl bg-zinc-50 p-6 dark:bg-zinc-900/50 flex flex-col justify-center">
            <h4 className="text-lg font-bold mb-4">After {years} Years:</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Total Rent Paid</span>
                <span className="font-semibold text-red-500">{formatCurrency(totalRentPaid)}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-2 dark:border-zinc-800">
                <span className="text-zinc-600 dark:text-zinc-400">Est. Property Value (5% growth)</span>
                <span className="font-semibold text-emerald-500">{formatCurrency(estimatedAppreciation)}</span>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg text-center font-bold text-white shadow-sm" style={{ backgroundColor: isBuyingBetter ? '#10b981' : '#f59e0b' }}>
              {isBuyingBetter ? 'Buying is Financially Better' : 'Renting is Financially Better'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
