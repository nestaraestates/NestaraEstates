'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export function NotificationBell({ initialCount, userId }: { initialCount: number, userId: string }) {
  const [unreadCount, setUnreadCount] = useState(initialCount)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`notifications_changes_${Math.random()}`)
      .on('postgres_changes', {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, async (payload) => {
        // Re-fetch count to be safe, or just increment on INSERT and decrement on DELETE
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)
        
        setUnreadCount(count || 0)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  return (
    <Link href="/notifications">
      <Button variant="ghost" size="icon" className="relative text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-900/30">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        )}
        <span className="sr-only">Notifications</span>
      </Button>
    </Link>
  )
}
