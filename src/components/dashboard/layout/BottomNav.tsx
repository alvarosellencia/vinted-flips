'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Boxes, Shirt, Download, Plus, LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'
import { supabase } from '@/lib/supabase/client'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const active = (href: string) => pathname === href

  async function signOut() {
    const ok = confirm('¿Cerrar sesión?')
    if (!ok) return
    await supabase.auth.signOut()
    router.replace('/auth')
    router.refresh()
  }

  // Hard refresh para iOS/Safari (evita “veo el deploy viejo”)
  function hardRefresh() {
    const url = new URL(window.location.href)
    url.searchParams.set('v', Date.now().toString())
    window.location.replace(url.toString())
  }

  const tabClass = (href: string) =>
    `flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-xs transition ${
      active(href) ? 'text-[#7B1DF7] bg-[#7B1DF7]/10' : 'text-gray-600 hover:bg-gray-50'
    }`

  return (
    <>
      <nav
        className={[
          'md:hidden fixed bottom-0 left-0 right-0 z-[9999]',
          'bg-white/90 backdrop-blur border-t border-gray-200',
          'pointer-events-auto',
        ].join(' ')}
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 6px)',
        }}
      >
        <div className="mx-auto max-w-md px-3 pt-2">
          <div className="grid grid-cols-5 items-center gap-2">
            <Link href="/" className={tabClass('/')}>
              <LayoutDashboard className="h-5 w-5" />
              Resumen
            </Link>

            <Link href="/lots" className={tabClass('/lots')}>
              <Boxes className="h-5 w-5" />
              Lotes
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center justify-center"
              aria-label="Añadir"
            >
              <div className="h-14 w-14 rounded-full bg-[#7B1DF7] text-white flex items-center justify-center shadow-lg">
                <Plus className="h-6 w-6" />
              </div>
            </button>

            <Link href="/items" className={tabClass('/items')}>
              <Shirt className="h-5 w-5" />
              Prendas
            </Link>

            <div className="relative flex flex-col items-center justify-center">
              <Link href="/export" className={`${tabClass('/export')} w-full`}>
                <Download className="h-5 w-5" />
                Export
              </Link>

              {/* Logout: más visible + separado del borde */}
              <button
                type="button"
                onClick={signOut}
                className="absolute -top-2 -right-2 h-9 w-9 rounded-full border border-gray-200 bg-white shadow-md flex items-center justify-center"
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 text-gray-800" />
              </button>

              {/* Refresh: para forzar deploy nuevo en iOS sin cerrar sesión */}
              <button
                type="button"
                onClick={hardRefresh}
                className="absolute -top-2 -left-2 h-9 w-9 rounded-full border border-gray-200 bg-white shadow-md flex items-center justify-center"
                aria-label="Actualizar"
                title="Actualizar"
              >
                <RefreshCw className="h-4 w-4 text-gray-800" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}