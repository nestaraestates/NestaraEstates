'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapIcon } from 'lucide-react'

const AREA_UNITS: Record<string, number> = {
  'Sq Ft': 1,
  'Sq Meter': 10.7639,
  'Sq Yard': 9,
  'Acre': 43560,
  'Hectare': 107639,
  'Bigha': 27225,
  'Gunta': 1089,
}

export function AreaConverter() {
  const [inputValue, setInputValue] = useState<string>('1000')
  const [fromUnit, setFromUnit] = useState<string>('Sq Ft')
  
  const value = parseFloat(inputValue) || 0
  const valueInSqFt = value * AREA_UNITS[fromUnit]

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-orange-600" />
          Area Converter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="area_value">Area Value</Label>
              <div className="flex rounded-md shadow-sm">
                <Input 
                  id="area_value"
                  type="number" 
                  value={inputValue} 
                  onChange={(e) => setInputValue(e.target.value)}
                  className="rounded-r-none border-r-0"
                />
                <select 
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="rounded-l-none rounded-r-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {Object.keys(AREA_UNITS).map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.keys(AREA_UNITS).map((unit) => (
                <button
                  key={unit}
                  onClick={() => setFromUnit(unit)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                    fromUnit === unit 
                      ? 'bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' 
                      : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50/50 dark:bg-orange-900/10 rounded-xl p-5 border border-orange-100 dark:border-orange-900/30 h-full">
            <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-400 mb-4">Converted Values</h3>
            <div className="space-y-3">
              {Object.keys(AREA_UNITS).map((unit) => {
                if (unit === fromUnit) return null;
                const converted = valueInSqFt / AREA_UNITS[unit];
                return (
                  <div key={unit} className="flex justify-between items-center border-b border-orange-200/50 dark:border-orange-900/50 pb-2 last:border-0 last:pb-0">
                    <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{unit}</span>
                    <span className="font-bold text-orange-700 dark:text-orange-500">
                      {converted < 1 ? converted.toFixed(4) : converted.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
