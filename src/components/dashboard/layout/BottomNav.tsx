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

  const item = (href: string) =>
    `flex flex-col items-center justify-center gap-1 text-[11px] ${
      pathname === href ? 'text-[#7B1DF7] font-medium' : 'text-gray-600'
    }`

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
        <div className="mx-auto max-w-md h-full flex items-center justify-around px-2">
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
            className="w-12 h-12 rounded-full bg-[#7B1DF7] text-white flex items-center justify-center -mt-6 shadow-lg"
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

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}
