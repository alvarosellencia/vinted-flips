'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'

export default function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/lots') localStorage.setItem('vf:lastTab', 'lots')
    if (pathname === '/items') localStorage.setItem('vf:lastTab', 'items')
  }, [pathname])

  const linkClass = (href: string) =>
    `text-sm ${pathname === href ? 'text-[#7B1DF7] font-medium' : 'text-gray-600'}`

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 z-50">
        <div className="max-w-md mx-auto h-full flex items-center justify-around">
          <Link className={linkClass('/')} href="/">Resumen</Link>
          <Link className={linkClass('/lots')} href="/lots">Lotes</Link>

          <button
            onClick={() => setOpen(true)}
            className="w-12 h-12 rounded-full bg-[#7B1DF7] text-white flex items-center justify-center -mt-6 shadow-lg"
            aria-label="Añadir"
          >
            <Plus />
          </button>

          <Link className={linkClass('/items')} href="/items">Prendas</Link>
          <Link className={linkClass('/export')} href="/export">Export</Link>
        </div>
      </nav>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}
