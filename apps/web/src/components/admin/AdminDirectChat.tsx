'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { sendDirectMessage } from '@/app/actions/direct-chat'
import { createClient } from '@/utils/supabase/client'

export function AdminDirectChat({ propertyId, sellerId, adminId }: { propertyId: string, sellerId: string, adminId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!isOpen) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`direct_messages_${propertyId}_${Math.random()}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `property_id=eq.${propertyId}`
      }, payload => {
        setMessages(prev => {
          if (prev.some(m => m.id === payload.new.id)) return prev;
          
          const hasOptimistic = prev.some(m => m.id.toString().startsWith('temp-') && m.message === payload.new.message);
          
          if (hasOptimistic) {
            let replaced = false;
            return prev.map(m => {
              if (!replaced && m.id.toString().startsWith('temp-') && m.message === payload.new.message) {
                replaced = true;
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
  }, [isOpen, propertyId, supabase])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return

    const tempId = `temp-${Date.now()}`
    const newMessage = {
      id: tempId,
      property_id: propertyId,
      sender_id: adminId,
      receiver_id: sellerId,
      message: inputText.trim(),
      created_at: new Date().toISOString(),
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

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-2"
      >
        <MessageSquare className="h-4 w-4" /> Open In-App Chat with Seller
      </button>
    )
  }

  return (
    <div className="flex flex-col h-[400px] border border-blue-200 rounded-xl bg-zinc-50 overflow-hidden mt-4 shadow-sm">
      <div className="bg-blue-600 text-white p-3 font-bold flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Direct Chat
        </div>
        <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white">Close</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 text-sm mt-10">No messages yet. Send a message to the seller about their listing.</div>
        )}
        {messages.map(msg => {
          const isAdmin = msg.sender_id === adminId
          return (
            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isAdmin ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm'
              }`}>
                {msg.message}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-white border-t border-zinc-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-zinc-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 border-none"
          />
          <button type="submit" disabled={!inputText.trim() || isSending} className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-blue-700">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
