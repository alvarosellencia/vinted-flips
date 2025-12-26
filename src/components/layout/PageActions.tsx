'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Download } from 'lucide-react'
import AddMenuModal from '@/components/dashboard/modals/AddMenuModal'

type Props = {
  context?: 'summary' | 'lots' | 'items' | 'export'
  showAdd?: boolean
  showExport?: boolean
}

export default function PageActions({
  context = 'summary',
  showAdd = true,
  showExport = true
}: Props) {
  const [open, setOpen] = useState(false)
  const exportDisabled = context === 'summary' || context === 'export'

  return (
    <>
      <div className="flex items-center gap-2">
        {showExport ? (
          exportDisabled ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-gray-400 shadow-[var(--shadow-xs)]"
              title="El export CSV solo funciona desde Lotes o Prendas."
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          ) : (
            <Link
              href="/export"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 shadow-[var(--shadow-xs)]"
              title="Exportar CSV"
            >
              <Download className="h-4 w-4" />
              Export
            </Link>
          )
        ) : null}

        {showAdd ? (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white shadow-[var(--shadow-sm)] active:scale-[0.99]"
            title="Añadir"
          >
            <Plus className="h-4 w-4" />
            Añadir
          </button>
        ) : null}
      </div>

      {open && <AddMenuModal onClose={() => setOpen(false)} />}
    </>
  )
}
