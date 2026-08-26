'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export function UrlToasts() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success) {
      setToast({ message: success, type: 'success' })
      cleanUrl()
    } else if (error) {
      setToast({ message: error, type: 'error' })
      cleanUrl()
    }
  }, [searchParams])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const cleanUrl = () => {
    // Remove success/error from URL without navigating
    const params = new URLSearchParams(searchParams.toString())
    params.delete('success')
    params.delete('error')
    
    const newSearch = params.toString()
    const newUrl = pathname + (newSearch ? `?${newSearch}` : '')
    router.replace(newUrl, { scroll: false })
  }

  if (!toast) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
        toast.type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-900 dark:text-green-300'
          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300'
      }`}>
        {toast.type === 'success' ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}
        <p className="font-medium text-sm">{toast.message}</p>
        <button 
          onClick={() => setToast(null)}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
