'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'
import React from 'react'

export function SubmitButton({ 
  children, 
  className,
  loadingText
}: { 
  children: React.ReactNode
  className?: string
  loadingText?: string
}) {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} flex items-center justify-center ${pending ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText || children}
        </>
      ) : children}
    </button>
  )
}
