'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Boxes, Shirt, Download, Plus } from 'lucide-react'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'

export default function SidebarNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const item = (href: string) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
      pathname === href ? 'bg-[#7B1DF7]/10 text-[#7B1DF7] font-medium' : 'text-gray-700 hover:bg-gray-50'
    }`

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:border-gray-200 md:p-4 md:gap-2">
        <div className="px-2 py-2">
          <div className="text-sm text-gray-500">Vinted Flips</div>
          <div className="text-lg font-semibold tracking-tight">Panel</div>
        </div>

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

        <div className="mt-2">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-xl bg-[#7B1DF7] text-white py-2 text-sm font-medium shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir
          </button>
        </div>
      </aside>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}
