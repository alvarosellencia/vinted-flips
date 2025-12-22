'use client'

import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { supabase } from '@/lib/supabase/client'
import type { Item, ItemStatusDb, Lot } from '@/lib/types'
import { safeUnitCost, normalizeStatus, statusLabel } from '@/lib/utils'
import { insertItem, updateItem, deleteItem } from '@/lib/supabase/write'

const statuses: ItemStatusDb[] = ['for_sale', 'reserved', 'sold', 'returned']

export default function ItemFormModal({
  onClose,
  item
}: {
  onClose: () => void
  item?: Item
}) {
  const isEdit = !!item

  const [lots, setLots] = useState<Lot[]>([])
  const [name, setName] = useState((item?.name ?? item?.title ?? '') as string)
  const [status, setStatus] = useState<ItemStatusDb>(normalizeStatus(item?.status))
  const [size, setSize] = useState(item?.size ?? '')
  const [lotId, setLotId] = useState<string>(item?.lot_id ?? '')
  const [purchaseCost, setPurchaseCost] = useState<string>(item?.purchase_cost?.toString() ?? '')
  const [salePrice, setSalePrice] = useState<string>(item?.sale_price?.toString() ?? '')
  const [saleDate, setSaleDate] = useState<string>((item?.sale_date ?? '').slice(0, 10))
  const [platform, setPlatform] = useState(item?.platform ?? '')
  const [notes, setNotes] = useState(((item as any)?.notes ?? '') as string)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadLots() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) return
      const { data } = await supabase.from('lots').select('*').eq('user_id', uid).order('purchase_date', { ascending: false })
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
        sale_date: status === 'sold' ? (saleDate || null) : null,
        platform: platform.trim() || null,
        notes: notes.trim() || null
      }

      const res = isEdit
        ? await updateItem(item!.id, uid, payload)
        : await insertItem(payload)

      if (res.error) throw res.error

      window.dispatchEvent(new Event('vf:data-changed'))
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Error guardando prenda')
    } finally {
      setLoading(false)
    }
  }

  async function onRemove() {
    if (!isEdit) return
    if (!confirm('¿Eliminar esta prenda?')) return

    setLoading(true)
    setError(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) throw new Error('No hay sesión')

      const res = await deleteItem(item!.id, uid)
      if (res.error) throw res.error

      window.dispatchEvent(new Event('vf:data-changed'))
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Error eliminando prenda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal onClose={onClose} title={isEdit ? 'Editar prenda' : 'Añadir prenda'}>
      <div className="mt-4 space-y-3">
        <label className="text-xs text-gray-500">
          Nombre
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Sudadera Nike Tech azul"
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-500">
            Estado
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ItemStatusDb)}
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm bg-white"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-gray-500">
            Talla
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="Ej. L / XL / 44"
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
            />
          </label>
        </div>

        <label className="text-xs text-gray-500">
          Lote (opcional)
          <select
            value={lotId}
            onChange={(e) => setLotId(e.target.value)}
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm bg-white"
          >
            <option value="">Sin lote</option>
            {lots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-500">
            Coste (€)
            <input
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder={lotId ? `Vacío = ${unitCost.toFixed(2)}€` : 'Ej. 6.00'}
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
              inputMode="decimal"
            />
          </label>

          <label className="text-xs text-gray-500">
            Venta (€)
            <input
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              placeholder={status === 'sold' ? 'Obligatorio si vendida' : 'Opcional'}
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
              inputMode="decimal"
            />
          </label>
        </div>

        {status === 'sold' && (
          <label className="text-xs text-gray-500">
            Fecha de venta (opcional)
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="text-xs text-gray-500">
          Plataforma (opcional)
          <input
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            placeholder="Vinted, Wallapop…"
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm"
          />
        </label>

        <label className="text-xs text-gray-500">
          Notas (opcional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Estado, defectos, envío, etc."
            className="mt-1 w-full border border-gray-200 rounded-2xl px-3 py-2 text-sm min-h-[84px]"
          />
        </label>

        {error && <div className="text-sm text-red-700">{error}</div>}

        <button
          onClick={onSave}
          disabled={loading || !name.trim()}
          className="w-full rounded-2xl bg-[#7B1DF7] text-white py-3 text-sm font-medium shadow-sm disabled:opacity-60"
        >
          {loading ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear prenda'}
        </button>

        {isEdit && (
          <button
            onClick={onRemove}
            disabled={loading}
            className="w-full rounded-2xl border border-red-200 text-red-700 py-3 text-sm font-medium hover:bg-red-50 disabled:opacity-60"
          >
            Eliminar prenda
          </button>
        )}
      </div>
    </Modal>
  )
}
