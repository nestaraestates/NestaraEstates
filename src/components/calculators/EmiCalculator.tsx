'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EmiCalculator({ defaultPrice = 5000000 }: { defaultPrice?: number }) {
  const [price, setPrice] = useState<number | ''>(defaultPrice)
  const [downPayment, setDownPayment] = useState<number | ''>('')
  const [interestRate, setInterestRate] = useState<number | ''>('')
  const [tenureYears, setTenureYears] = useState<number | ''>('')

  const p = Number(price) || 0
  const dp = Number(downPayment) || 0
  const ir = Number(interestRate) || 0
  const ty = Number(tenureYears) || 0

  const principal = p - dp
  const r = ir / 12 / 100
  const n = ty * 12
  
  let emi = 0
  let totalInterest = 0
  let totalAmount = p
  
  if (principal > 0 && r > 0 && n > 0) {
    emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    totalAmount = totalPayment + dp
    totalInterest = totalPayment - principal
  }

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl">EMI Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Price (₹)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Down Payment (₹)</Label>
              <Input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input type="number" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Loan Tenure (Years)</Label>
                <Input type="number" value={tenureYears} onChange={(e) => setTenureYears(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0" />
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="rounded-xl bg-amber-50 p-6 dark:bg-amber-950/20 flex flex-col justify-center">
            <div className="mb-6 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Your Monthly EMI</p>
              <p className="text-4xl font-bold text-amber-600 dark:text-amber-500">{formatCurrency(emi)}</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-amber-200/50 pb-2 dark:border-amber-900/50">
                <span className="text-zinc-600 dark:text-zinc-400">Principal Amount</span>
                <span className="font-semibold">{formatCurrency((Number(price) || 0) - (Number(downPayment) || 0))}</span>
              </div>
              <div className="flex justify-between border-b border-amber-200/50 pb-2 dark:border-amber-900/50">
                <span className="text-zinc-600 dark:text-zinc-400">Total Interest</span>
                <span className="font-semibold">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-900 dark:text-white pt-1">
                <span>Total Amount Payable</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
