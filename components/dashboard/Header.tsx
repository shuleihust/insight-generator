'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()
  }, [supabase])

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between">
      <div className="flex-1" />
      
      {/* User Info */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {user.email}
              </div>
              <div className="text-xs text-gray-500">
                用户
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}


