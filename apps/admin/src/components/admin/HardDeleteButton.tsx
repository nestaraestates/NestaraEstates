'use client'

import { Trash2, AlertTriangle } from 'lucide-react'
import { useTransition, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function HardDeleteButton({ onDelete }: { onDelete: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const modal = showModal && mounted ? createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-900">Are you absolutely sure?</h3>
              <p className="text-sm text-zinc-500 mt-1">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
            You are about to permanently delete this property. This will wipe all associated data, media files, and records from the database and storage. 
          </p>
          
          <div className="flex gap-3 justify-end">
            <button 
              type="button" 
              disabled={isPending}
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button" 
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await onDelete()
                  setShowModal(false)
                })
              }}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isPending ? 'Deleting...' : 'Yes, Delete Property'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <>
      <button 
        type="button" 
        onClick={() => setShowModal(true)}
        className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
      >
        <Trash2 className="h-4 w-4" /> Permanently Delete
      </button>
      {modal}
    </>
  )
}
