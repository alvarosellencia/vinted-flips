'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Login from '@/components/auth/Login'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    let mounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSignedIn(!!data.session)
      setReady(true)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session)
      setReady(true)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-gray-500">
        Cargando…
      </div>
    )
  }

  if (!signedIn) return <Login />

  return <>{children}</>
}
