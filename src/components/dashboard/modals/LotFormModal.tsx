'use client'

import { useState } from 'react'
import Modal from './Modal'
import { supabase } from '@/lib/supabase/client'
import type { Lot } from '@/lib/types'
import { insertLot, updateLot, deleteLot } from '@/lib/supabase/write'

export default function LotFormModal({
  onClose,
  lot
}: {
  onClose: () => void
  lot?: Lot
}) {
  const isEdit = !!lot

  const [name, setName] = useState(lot?.name ?? '')
  const [purchaseDate, setPurchaseDate] = useState((lot?.purchase_date ?? '').slice(0, 10))
  const [itemsCount, setItemsCount] = useState<number>(Number(lot?.items_count ?? 1))
  const [totalCost, setTotalCost] = useState<number>(Number(lot?.total_cost ?? 0))
  const [provider, setProvider] = useState(lot?.provider ?? '')
  const [notes, setNotes] = useState(((lot as any)?.notes ?? '') as string)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setError(null)
    setLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) throw new Error('No hay sesión')

      const payload: any = {
        user_id: uid,
        name: name.trim(),
        purchase_date: purchaseDate || null,
        items_count: Number(itemsCount) || 0,
        total_cost: Number(totalCost) || 0,
        provider: provider.trim() || null,
        notes: notes.trim() || null
      }

      const res = isEdit
        ? await updateLot(lot!.id, uid, payload)
        : await insertLot(payload)

      if (res.error) throw res.error

      window.dispatchEvent(new Event('vf:data-changed'))
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Error guardando lote')
    } finally {
      setLoading(false)
    }
  }

  async function onRemove() {
    if (!isEdit) return
    if (!confirm('¿Eliminar este lote?')) return
    setLoading(true)
    setError(null)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) throw new Error('No hay sesión')

      const res = await deleteLot(lot!.id, uid)
      if (res.error) throw res.error

      window.dispatchEvent(new Event('vf:data-changed'))
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Error eliminando lote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Editar lote' : 'Añadir lote'}>
      <div className="mt-4 space-y-3">
        <label className="text-xs text-gray-500">
          Nombre del lote
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. LOTE-ZEUS-7camisas"
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs text-gray-500">
          Fecha de compra
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-500">
            Nº prendas
            <input
              type="number"
              min={0}
              value={itemsCount}
              onChange={(e) => setItemsCount(Number(e.target.value))}
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
            />
          </label>

          <label className="text-xs text-gray-500">
            Coste total (€)
            <input
              type="number"
              min={0}
              step="0.01"
              value={totalCost}
              onChange={(e) => setTotalCost(Number(e.target.value))}
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="text-xs text-gray-500">
          Proveedor
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Ej. Vinted / Mayorista / Tienda"
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs text-gray-500">
          Notas (opcional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Qué incluye, incidencias, etc."
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm min-h-[84px]"
          />
        </label>

        {error && <div className="text-sm text-red-700">{error}</div>}

        <button
          onClick={onSave}
          disabled={loading || !name.trim()}
          className="w-full rounded-2xl bg-[#7B1DF7] text-white py-3 text-sm font-medium shadow-sm disabled:opacity-60"
        >
          {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear lote'}
        </button>

        {isEdit && (
          <button
            onClick={onRemove}
            disabled={loading}
            className="w-full rounded-2xl border border-red-200 text-red-700 py-3 text-sm font-medium hover:bg-red-50 disabled:opacity-60"
          >
            Eliminar lote
          </button>
        )}
      </div>
    </Modal>
  )
}
