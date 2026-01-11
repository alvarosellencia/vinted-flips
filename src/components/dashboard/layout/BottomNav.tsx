'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Boxes, Shirt, Download, Plus, LogOut, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'
import { useLogout } from '@/lib/auth/useLogout'

export default function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { logout, isLoading } = useLogout()

  // Helper para verificar ruta activa
  const active = (href: string) => pathname === href

  // Hard refresh manual para desarrollo o emergencias en iOS
  const handleHardRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const handleLogout = async () => {
    const ok = confirm('¿Cerrar sesión en este dispositivo?')
    if (ok) await logout()
  }

  const tabClass = (href: string) =>
    `relative flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-medium transition-colors ${
      active(href) 
        ? 'text-[#7B1DF7] bg-[#7B1DF7]/5' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-[50] border-t border-gray-200 bg-white/95 backdrop-blur-lg md:hidden pb-[env(safe-area-inset-bottom)]"
      >
        <div className="mx-auto max-w-md px-2 pt-2 pb-2">
          <div className="grid grid-cols-5 items-center gap-1">
            {/* 1. Resumen */}
            <Link href="/" className={tabClass('/')}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Inicio</span>
            </Link>

            {/* 2. Lotes */}
            <Link href="/lots" className={tabClass('/lots')}>
              <Boxes className="h-5 w-5" />
              <span>Lotes</span>
            </Link>

            {/* 3. Acción Principal (ADD) */}
            <div className="flex justify-center -mt-6">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7B1DF7] text-white shadow-lg shadow-purple-500/30 transition-transform active:scale-95"
                aria-label="Añadir nuevo"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            {/* 4. Prendas */}
            <Link href="/items" className={tabClass('/items')}>
              <Shirt className="h-5 w-5" />
              <span>Prendas</span>
            </Link>

            {/* 5. Tools (Export + Logout + Refresh) */}
            <div className="relative group flex flex-col items-center justify-center">
              <Link href="/export" className={`${tabClass('/export')} w-full`}>
                <Download className="h-5 w-5" />
                <span>Export</span>
              </Link>

              {/* Botones Flotantes (Satélites) - Mejor posicionados */}
              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoading}
                className="absolute -top-10 right-0 p-2 rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>

              {/* Refresh */}
              <button
                type="button"
                onClick={handleHardRefresh}
                className="absolute -top-10 left-0 p-2 rounded-full bg-gray-50 text-gray-600 border border-gray-100 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Refrescar app"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}