'use client'

import { useState } from 'react'
import Modal from './Modal'
import { supabase } from '@/lib/supabase/client'

export default function LotFormModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [itemsCount, setItemsCount] = useState<number>(1)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [provider, setProvider] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setError(null)
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) throw new Error('No hay sesión')

      const { error } = await supabase.from('lots').insert({
        user_id: uid,
        name: name.trim(),
        purchase_date: purchaseDate || null,
        items_count: Number(itemsCount) || 0,
        total_cost: Number(totalCost) || 0,
        provider: provider.trim() || null,
        notes: notes.trim() || null
      })

      if (error) throw error

      window.dispatchEvent(new Event('vf:data-changed'))
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Error creando lote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-semibold">Añadir lote</h3>

      <div className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del lote"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={purchaseDate}
          onChange={(e) => setPurchaseDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={itemsCount}
            onChange={(e) => setItemsCount(Number(e.target.value))}
            placeholder="Prendas"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={totalCost}
            onChange={(e) => setTotalCost(Number(e.target.value))}
            placeholder="Coste total"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>
        <input
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="Proveedor"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm min-h-[84px]"
        />

        {error && <div className="text-sm text-red-700">{error}</div>}

        <button
          onClick={onSave}
          disabled={loading || !name.trim()}
          className="w-full rounded-xl bg-[#7B1DF7] text-white py-2 text-sm font-medium shadow-sm disabled:opacity-60"
        >
          {loading ? 'Guardando…' : 'Crear lote'}
        </button>
      </div>
    </Modal>
  )
}
