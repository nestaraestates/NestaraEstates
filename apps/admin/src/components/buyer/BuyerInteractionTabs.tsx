'use client'

import { useState } from 'react'
import { MessageSquare, ClipboardList, ChevronLeft } from 'lucide-react'
import { BuyerDirectChat } from './BuyerDirectChat'
import { EnquiryWidget } from './EnquiryWidget'

export function BuyerInteractionTabs({ propertyId, buyerId, initialEnquiryId, profile, hasEnquiry }: any) {
  const [activeView, setActiveView] = useState<'menu' | 'chat' | 'enquiry'>('menu')

  if (activeView === 'menu') {
    return (
      <div className="space-y-3">
        {!hasEnquiry && (
          <button
            onClick={() => setActiveView('enquiry')}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-amber-200 dark:border-amber-900/50 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg text-amber-600 dark:text-amber-400">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Apply for Enquiry</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Submit your details to the agent</p>
              </div>
            </div>
          </button>
        )}

        <button
          onClick={() => setActiveView('chat')}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-900/50 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors shadow-sm group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Chat with Agent</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Instantly message our team</p>
            </div>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-3">
      <button 
        onClick={() => setActiveView('menu')}
        className="flex items-center text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white self-start"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Back to options
      </button>

      {activeView === 'chat' && (
        <div className="h-[450px]">
          <BuyerDirectChat initialEnquiryId={initialEnquiryId} propertyId={propertyId} buyerId={buyerId} alwaysOpen={true} />
        </div>
      )}

      {activeView === 'enquiry' && (
        <div className="p-0 border-none shadow-none">
          <EnquiryWidget propertyId={propertyId} profile={profile} forceOpen={true} onCancel={() => setActiveView('menu')} />
        </div>
      )}
    </div>
  )
}
