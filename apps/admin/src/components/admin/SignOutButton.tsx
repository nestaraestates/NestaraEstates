'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export function SignOutButton() {
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button 
      onClick={handleSignOut}
      className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center group"
      title="Sign Out"
    >
      <LogOut className="h-5 w-5" />
    </button>
  )
}
