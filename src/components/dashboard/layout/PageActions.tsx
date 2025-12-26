'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Download, LogOut, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'

export default function PageActions({ context }: { context?: 'items' | 'lots' | 'export' | 'summary' }) {
  const router = useRouter()
  const [openAdd, setOpenAdd] = useState(false)
  const showExport = context === 'items' || context === 'lots'

  async function logout() {
    await supabase.auth.signOut()
    router.replace('/auth')
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {showExport && (
          <Link
            href="/export"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </Link>
        )}

        <button
          type="button"
          onClick={() => setOpenAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7B1DF7] px-3 py-2 text-sm font-medium text-white shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Añadir
        </button>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>

      {openAdd && <AddMenuModal onClose={() => setOpenAdd(false)} />}
    </>
  )
}