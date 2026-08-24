'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { startChatEnquiry } from '@/app/actions/direct-chat'
import { createClient } from '@/utils/supabase/client'

export function BuyerDirectChat({ initialEnquiryId, propertyId, buyerId, alwaysOpen = false, autoOpen = false }: { initialEnquiryId: string | null, propertyId: string, buyerId: string, alwaysOpen?: boolean, autoOpen?: boolean }) {
  const [enquiryId, setEnquiryId] = useState<string | null>(initialEnquiryId)
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isOpen, setIsOpen] = useState(alwaysOpen || autoOpen)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => setIsOpen(true), 0)
      return () => clearTimeout(timer)
    }
  }, [autoOpen])

  useEffect(() => {
    if (!isOpen || !enquiryId) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('enquiry_id', enquiryId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }

    fetchMessages()

    const channel = supabase
      .channel(`buyer_chat_${enquiryId}_${Math.random()}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `enquiry_id=eq.${enquiryId}`
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
  }, [isOpen, enquiryId, supabase])

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
      enquiry_id: enquiryId,
      property_id: propertyId,
      sender_id: buyerId,
      receiver_id: null,
      message: inputText.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMessage])
    const currentInput = inputText.trim()
    setInputText('')
    setIsSending(true)

    const res = await startChatEnquiry(propertyId, currentInput, enquiryId)
    
    if (res.error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      alert('Failed to send message: ' + res.error)
    } else {
      if (!enquiryId && res.enquiryId) {
        setEnquiryId(res.enquiryId)
      }
    }
    
    setIsSending(false)
  }

  if (!buyerId) {
    return (
      <div className={`flex flex-col items-center justify-center ${alwaysOpen ? 'h-full border-none' : 'h-[350px] border mt-4'} border-emerald-200 rounded-xl bg-zinc-50 shadow-sm w-full p-6 text-center`}>
        <MessageSquare className="h-12 w-12 text-emerald-300 mb-4" />
        <h3 className="text-lg font-bold text-zinc-900 mb-2">Login Required</h3>
        <p className="text-sm text-zinc-500 mb-6">You must be logged in to chat with a Nestara agent.</p>
        <a href="/login" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg">
          Log In
        </a>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto"
      >
        <MessageSquare className="h-4 w-4" /> Message Agent
      </button>
    )
  }

  return (
    <div className={`flex flex-col ${alwaysOpen ? 'h-full border-none' : 'h-[350px] border mt-4'} border-emerald-200 rounded-xl bg-zinc-50 overflow-hidden shadow-sm w-full`}>
      <div className="bg-emerald-600 text-white p-3 font-bold flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Nestara Agent Chat
        </div>
        {!alwaysOpen && (
          <button onClick={() => setIsOpen(false)} className="text-emerald-100 hover:text-white">Close</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-zinc-400 text-sm mt-10">
            You are connected with a Nestara agent.<br/>How can we help with this property?
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === buyerId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm'
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
            className="flex-1 bg-zinc-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500 border-none"
          />
          <button type="submit" disabled={!inputText.trim() || isSending} className="bg-emerald-600 text-white p-2 rounded-lg disabled:opacity-50 hover:bg-emerald-700">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
