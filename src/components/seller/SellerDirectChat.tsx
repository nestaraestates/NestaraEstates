'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { sendDirectMessage } from '@/app/actions/direct-chat'
import { createClient } from '@/utils/supabase/client'

export function SellerDirectChat({ propertyId, sellerId, autoOpen = false }: { propertyId: string, sellerId: string, autoOpen?: boolean }) {
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(autoOpen)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => setIsOpen(true), 0)
      return () => clearTimeout(timer)
    }
  }, [autoOpen])

  // We assume admin receiverId is the superadmin for direct chats.
  // In a real multi-admin system, you might fetch assigned admin ID. 
  // For now, we will send receiver_id as a dummy UUID or let the backend handle it.
  // Actually, wait, sender is sellerId, receiver is admin.
  // If we just save receiver_id = sellerId on the server, it would be weird. 
  // Let's modify sendDirectMessage to handle it.

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
      sender_id: sellerId,
      receiver_id: null, // Broadcast to all admins essentially
      message: inputText.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
    setIsSending(true)

    // Seller sending message to admin. Receiver is null (for any admin)
    const res = await sendDirectMessage(propertyId, '00000000-0000-0000-0000-000000000000', newMessage.message)
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
        className="flex items-center justify-center gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <MessageSquare className="h-4 w-4" /> Message Nestara Agent
      </button>
    )
  }

  return (
    <div className="flex flex-col h-[300px] border border-amber-200 rounded-xl bg-zinc-50 overflow-hidden shadow-sm w-full md:w-[400px]">
      <div className="bg-amber-500 text-white p-3 font-bold flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Support / Agent
        </div>
        <button onClick={() => setIsOpen(false)} className="text-amber-100 hover:text-white">Close</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 text-sm mt-10">You are connected with Nestara support.</div>
        )}
        {messages.map(msg => {
          const isSeller = msg.sender_id === sellerId
          return (
            <div key={msg.id} className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isSeller ? 'bg-amber-500 text-white rounded-tr-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm'
              }`}>
                {msg.message}
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-2 bg-white border-t border-zinc-200">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-zinc-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-500 border-none"
          />
          <button type="submit" disabled={!inputText.trim() || isSending} className="bg-amber-500 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-amber-600">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
