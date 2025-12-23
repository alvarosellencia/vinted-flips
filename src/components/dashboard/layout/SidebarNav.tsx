'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Boxes, Shirt, Download, Plus, LogOut } from 'lucide-react'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'
import { supabase } from '@/lib/supabase/client'

export default function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const item = (href: string) =>
    `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
      pathname === href
        ? 'bg-[var(--primary-weak)] text-[var(--primary)] font-medium'
        : 'text-gray-700 hover:bg-gray-50'
    }`

  async function onSignOut() {
    try {
      setSigningOut(true)
      await supabase.auth.signOut()
      router.replace('/')
      router.refresh()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-72 md:border-r md:border-[var(--border)] md:px-5 md:py-6 md:gap-2 bg-white">
        <div className="flex items-start justify-between gap-3 px-1 pb-3">
          <div>
            <div className="text-xs text-[var(--muted)]">Vinted Flips</div>
            <div className="text-lg font-semibold tracking-tight">Panel</div>
          </div>

          <button
            onClick={onSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">{signingOut ? 'Saliendo…' : 'Salir'}</span>
          </button>
        </div>

        <div className="h-px bg-[var(--border)] mb-2" />

        <Link href="/" className={item('/')}>
          <LayoutDashboard className="h-4 w-4" />
          Resumen
        </Link>
        <Link href="/lots" className={item('/lots')}>
          <Boxes className="h-4 w-4" />
          Lotes
        </Link>
        <Link href="/items" className={item('/items')}>
          <Shirt className="h-4 w-4" />
          Prendas
        </Link>
        <Link href="/export" className={item('/export')}>
          <Download className="h-4 w-4" />
          Export
        </Link>

        <div className="mt-3">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-2xl bg-[var(--primary)] text-white py-2.5 text-sm font-medium shadow-[var(--shadow-sm)] flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4" />
            Añadir
          </button>
        </div>

        <div className="mt-auto pt-6 text-xs text-[var(--muted)]">
          <div className="rounded-2xl border border-[var(--border)] bg-white px-3 py-3 shadow-[var(--shadow-xs)]">
            Consejo: usa <span className="font-medium text-[var(--fg)]">Export</span> desde Lotes o Prendas.
          </div>
        </div>
      </aside>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}
