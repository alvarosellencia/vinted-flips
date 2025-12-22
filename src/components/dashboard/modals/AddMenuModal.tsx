'use client'

import { useState } from 'react'
import { Boxes, Shirt } from 'lucide-react'
import Modal from './Modal'
import ItemFormModal from './ItemFormModal'
import LotFormModal from './LotFormModal'

export default function AddMenuModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'menu' | 'item' | 'lot'>('menu')

  if (mode === 'item') return <ItemFormModal onClose={onClose} />
  if (mode === 'lot') return <LotFormModal onClose={onClose} />

  return (
    <Modal onClose={onClose} title="Añadir">
      <p className="text-sm text-gray-500 mt-1">Crea una prenda o un lote.</p>

      <div className="mt-4 space-y-2">
        <button
          onClick={() => setMode('item')}
          className="w-full rounded-2xl border border-gray-200 py-3 text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Shirt className="h-4 w-4" />
          Añadir prenda
        </button>

        <button
          onClick={() => setMode('lot')}
          className="w-full rounded-2xl border border-gray-200 py-3 text-sm hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Boxes className="h-4 w-4" />
          Añadir lote
        </button>
      </div>
    </Modal>
  )
}
