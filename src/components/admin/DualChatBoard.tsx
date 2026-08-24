'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User, Building, Phone, MessageSquare } from 'lucide-react'
import { sendChatMessage } from '@/app/actions/admin-chat'

type Tab = 'BUYER' | 'SELLER'

export function DualChatBoard({ enquiry, initialMessages, adminId }: { enquiry: any, initialMessages: any[], adminId: string }) {
  const [activeTab, setActiveTab] = useState<Tab>('BUYER')
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const buyerId = enquiry.user_id
  const sellerId = enquiry.properties?.owner_id

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, activeTab])

  // Filter messages for current tab
  const targetUserId = activeTab === 'BUYER' ? buyerId : sellerId
  const currentMessages = messages.filter(m => m.sender_id === targetUserId || m.receiver_id === targetUserId)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !targetUserId || isSending) return

    const tempId = `temp-${Date.now()}`
    const newMessage = {
      id: tempId,
      enquiry_id: enquiry.id,
      sender_id: adminId,
      receiver_id: targetUserId,
      message: inputText.trim(),
      created_at: new Date().toISOString(),
      is_read: false
    }

    // Optimistic UI update
    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsSending(true)

    const res = await sendChatMessage(enquiry.id, targetUserId, newMessage.message)
    if (res.error) {
      alert('Failed to send message')
      setMessages(prev => prev.filter(m => m.id !== tempId)) // Revert
    }
    
    setIsSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 relative">
      {/* Mobile-Friendly Top Tab Toggle */}
      <div className="flex p-3 bg-white border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
        <div className="flex w-full bg-zinc-100 rounded-lg p-1 border border-zinc-200">
          <button 
            onClick={() => setActiveTab('BUYER')}
            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
              activeTab === 'BUYER' ? 'bg-white text-blue-700 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <User className="h-4 w-4" /> Buyer {buyerId ? '' : '(Guest)'}
          </button>
          <button 
            onClick={() => setActiveTab('SELLER')}
            className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
              activeTab === 'SELLER' ? 'bg-white text-emerald-700 shadow-sm border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <Building className="h-4 w-4" /> Seller
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        
        {/* Context Info Box */}
        {activeTab === 'BUYER' && !buyerId && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
            <h3 className="font-bold text-amber-800 text-sm mb-1">Guest Buyer</h3>
            <p className="text-xs text-amber-700 mb-3">This buyer is not registered. Use WhatsApp or Phone to communicate.</p>
            <div className="flex justify-center gap-3">
              <a href={`tel:${enquiry.phone}`} className="flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-amber-700 text-xs font-bold hover:bg-amber-100">
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a href={`https://wa.me/${enquiry.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600">
                <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* The Messages */}
        {currentMessages.map(msg => {
          const isAdmin = msg.sender_id === adminId
          return (
            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                isAdmin 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                <div className={`text-[9px] mt-1 text-right font-medium ${isAdmin ? 'text-blue-200' : 'text-zinc-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}

        {currentMessages.length === 0 && targetUserId && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2 py-12">
            <MessageSquare className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No messages yet. Send a message to start.</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      {targetUserId ? (
        <div className="p-3 bg-white border-t border-zinc-200 pb-safe">
          <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
            <input 
              type="text" 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Message ${activeTab.toLowerCase()}...`}
              className="flex-1 bg-zinc-100 border-none focus:ring-2 focus:ring-blue-500 rounded-full px-4 py-3 text-sm outline-none"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim() || isSending}
              className="h-11 w-11 rounded-full bg-blue-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-300 transition-colors shrink-0 shadow-sm"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
