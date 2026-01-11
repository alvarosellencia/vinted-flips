import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export function useLogout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const logout = async () => {
    try {
      setIsLoading(true)
      // 1. Cerrar sesión en Supabase
      await supabase.auth.signOut()

      // 2. Limpiar almacenamiento local (Crítico para Safari)
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // 3. Forzar recarga dura hacia el login
        window.location.href = '/auth?reason=logout'
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      // Fallback
      window.location.href = '/auth'
    } finally {
      setIsLoading(false)
    }
  }

  return { logout, isLoading }
}