'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User } from 'lucide-react'
import { sendDirectMessage } from '@/app/actions/direct-chat'
import { createClient } from '@/utils/supabase/client'

export function FullScreenSellerChat({ propertyId, sellerId, initialMessages, adminId }: { propertyId: string, sellerId: string, initialMessages: any[], adminId: string }) {
  const [messages, setMessages] = useState(initialMessages)
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Realtime subscription
  useEffect(() => {
    const channelName = `direct_messages_${propertyId}_${Math.random()}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'direct_messages',
        filter: `property_id=eq.${propertyId}`
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          
          if (payload.new.id.toString().startsWith('temp-') || 
              (payload.new.message === prev[prev.length - 1]?.message && payload.new.sender_id === prev[prev.length - 1]?.sender_id)) {
            return prev.map(m => {
              if (m.id.toString().startsWith('temp-') && m.message === payload.new.message) {
                return payload.new;
              }
              return m;
            });
          }
          
          return [...prev, payload.new];
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [propertyId, supabase])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !sellerId || isSending) return

    const tempId = `temp-${Date.now()}`
    const newMessage = {
      id: tempId,
      property_id: propertyId,
      sender_id: adminId,
      receiver_id: sellerId,
      message: inputText.trim(),
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsSending(true)

    const res = await sendDirectMessage(propertyId, sellerId, newMessage.message)
    if (res.error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      alert('Failed to send message')
    }
    
    setIsSending(false)
  }

  return (
    <div className="h-full flex flex-col bg-zinc-50/50">
      <div className="flex border-b border-zinc-200">
        <button className="flex-1 py-4 text-sm font-bold border-b-2 bg-white text-zinc-900 border-zinc-900 transition-colors flex items-center justify-center gap-2">
          <User className="h-4 w-4" /> SELLER
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 text-sm mt-10">No messages yet. Send a message to start.</div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === adminId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                isMe ? 'bg-zinc-900 text-white rounded-tr-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                <div className={`text-[10px] mt-1 font-medium ${isMe ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-4 bg-white border-t border-zinc-200">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Message seller..." 
            className="w-full bg-zinc-100 border-transparent focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200 rounded-full pl-6 pr-14 py-4 text-sm outline-none transition-all"
            disabled={isSending}
          />
          <button 
            type="submit" 
            disabled={isSending || !inputText.trim()}
            className="absolute right-2 top-2 h-10 w-10 bg-zinc-900 text-white rounded-full flex items-center justify-center hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
