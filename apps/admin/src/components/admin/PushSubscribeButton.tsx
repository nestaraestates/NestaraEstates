'use client'

import { useState, useEffect } from 'react'
import { Bell, BellRing, BellOff, Loader2 } from 'lucide-react'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushSubscribeButton() {
  const [status, setStatus] = useState<'default' | 'enabled' | 'denied' | 'loading'>('default')

  useEffect(() => {
    if (!('Notification' in window)) {
      setStatus('denied')
      return
    }

    if (Notification.permission === 'granted') {
      setStatus('enabled')
    } else if (Notification.permission === 'denied') {
      setStatus('denied')
    }
  }, [])

  const handleSubscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported by your browser.')
      return
    }

    setStatus('loading')

    try {
      const permission = await Notification.requestPermission()
      
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY || 'BA_MISSING_KEY'
      if (vapidKey === 'BA_MISSING_KEY') {
         console.warn("NEXT_PUBLIC_VAPID_KEY is missing from environment variables")
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      })

      if (!res.ok) {
        throw new Error('Failed to save subscription to server')
      }

      setStatus('enabled')
    } catch (error) {
      console.error('Push subscription failed:', error)
      setStatus('default')
      alert('Failed to enable push notifications. Check console for details.')
    }
  }

  if (status === 'denied') {
    return (
      <button disabled title="Notifications blocked" className="rounded-md p-1.5 text-red-500 bg-red-50 cursor-not-allowed">
        <BellOff className="h-4 w-4" />
      </button>
    )
  }

  if (status === 'enabled') {
    return (
      <button disabled title="Notifications active" className="rounded-md p-1.5 text-blue-600 bg-blue-50">
        <BellRing className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button onClick={handleSubscribe} disabled={status === 'loading'} title="Enable Notifications" className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 transition-colors">
      {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
    </button>
  )
}
