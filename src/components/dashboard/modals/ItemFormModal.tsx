'use client'

import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { supabase } from '@/lib/supabase/client'
import type { ItemStatus, Lot } from '@/lib/types'
import { safeUnitCost } from '@/lib/utils'

const statuses: ItemStatus[] = ['en venta', 'vendida', 'reservada', 'devuelta']

export default function ItemFormModal({ onClose }: { onClose: () => void }) {
  const [lots, setLots] = useState<Lot[]>([])
  const [name, setName] = useState('')
  const [status, setStatus] = useState<ItemStatus>('en venta')
  const [size, setSize] = useState('')
  const [lotId, setLotId] = useState<string>('')
  const [purchaseCost, setPurchaseCost] = useState<string>('') // vacío = null
  const [salePrice, setSalePrice] = useState<string>('') // vacío = null
  const [platform, setPlatform] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadLots() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) return
      const { data } = await supabase.from('lots').select('*').eq('user_id', uid)
      if (!mounted) return
      setLots((data ?? []) as Lot[])
    }
    loadLots()
    return () => { mounted = false }
  }, [])

  const selectedLot = useMemo(() => lots.find((l) => l.id === lotId), [lots, lotId])
  const unitCost = useMemo(() => safeUnitCost(selectedLot), [selectedLot])

  async function onSave() {
    setError(null)
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) throw new Error('No hay sesión')

      const pc = purchaseCost.trim() === '' ? null : Number(purchaseCost)
      const sp = salePrice.trim() === '' ? null : Number(salePrice)

      const payload: any = {
        user_id: uid,
        name: name.trim(),
        status,
        size: size.trim() || null,
        lot_id: lotId || null,
        purchase_cost: pc,
        sale_price: sp,
        platform: platform.trim() || null,
        notes: notes.trim() || null
      }

      const { error } = await supabase.from('items').insert(payload)
      if (error) throw error

      window.dispatchEvent(new Event('vf:data-changed'))
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Error creando prenda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h3 className="text-lg font-semibold">Añadir prenda</h3>

      <div className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (ej. Sudadera Nike)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ItemStatus)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Talla"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </div>

        <select
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
        >
          <option value="">Sin lote</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={purchaseCost}
            onChange={(e) => setPurchaseCost(e.target.value)}
            placeholder={lotId ? `Coste (vacío = ${unitCost.toFixed(2)}€)` : 'Coste compra'}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            inputMode="decimal"
          />
          <input
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            placeholder="Precio venta"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            inputMode="decimal"
          />
        </div>

        <input
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          placeholder="Plataforma (Vinted, Wallapop…)"
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
          {loading ? 'Guardando…' : 'Crear prenda'}
        </button>
      </div>
    </Modal>
  )
}
