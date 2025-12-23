'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Boxes, Shirt, Download, Plus } from 'lucide-react'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'

export default function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/lots') localStorage.setItem('vf:lastTab', 'lots')
    if (pathname === '/items') localStorage.setItem('vf:lastTab', 'items')
  }, [pathname])

  const isActive = (href: string) => pathname === href

  const item = (href: string) =>
    [
      'flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] transition',
      isActive(href) ? 'text-[var(--primary)]' : 'text-gray-600 hover:text-gray-900'
    ].join(' ')

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="mx-auto max-w-md px-3 pb-[env(safe-area-inset-bottom)]">
          <nav className="h-16 rounded-3xl border border-[var(--border)] bg-white/85 backdrop-blur-xl shadow-[var(--shadow-md)]">
            <div className="h-full flex items-center justify-around">
              <Link className={item('/')} href="/">
                <LayoutDashboard className="h-5 w-5" />
                Resumen
              </Link>

              <Link className={item('/lots')} href="/lots">
                <Boxes className="h-5 w-5" />
                Lotes
              </Link>

              <button
                onClick={() => setOpen(true)}
                className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center -mt-7 shadow-[var(--shadow-md)] active:scale-[0.98]"
                aria-label="Añadir"
              >
                <Plus className="h-6 w-6" />
              </button>

              <Link className={item('/items')} href="/items">
                <Shirt className="h-5 w-5" />
                Prendas
              </Link>

              <Link className={item('/export')} href="/export">
                <Download className="h-5 w-5" />
                Export
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}
