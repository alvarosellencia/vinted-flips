'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const t = setTimeout(() => router.replace('/'), 600)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="p-4 text-sm text-gray-500">
      Procesando login…
    </div>
  )
}
