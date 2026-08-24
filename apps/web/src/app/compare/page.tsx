import { Suspense } from 'react'
import { CompareMatrix } from './CompareMatrix'

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Comparison Matrix</h1>
      <Suspense fallback={<div className="text-center py-24"><div className="animate-spin h-8 w-8 mx-auto border-4 border-amber-500 rounded-full border-t-transparent"></div></div>}>
        <CompareMatrix />
      </Suspense>
    </div>
  )
}
