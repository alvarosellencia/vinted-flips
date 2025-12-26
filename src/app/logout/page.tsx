'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      await supabase.auth.signOut()
      router.replace('/auth')
    })()
  }, [router])

  return <div className="p-6 text-sm text-gray-500">Cerrando sesión…</div>
}