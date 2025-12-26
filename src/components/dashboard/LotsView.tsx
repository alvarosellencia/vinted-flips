'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Lot } from '@/lib/types'
import Card from '@/components/ui/Card'
import SearchInput from '@/components/ui/SearchInput'
import DateFilter, { DateRange } from '@/components/dashboard/DateFilter'
import MiniBars from '@/components/charts/MiniBars'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatCurrency, formatDate, safeUnitCost, inRange, monthKey } from '@/lib/utils'
import { Pencil, Trash2, Plus } from 'lucide-react'
import LotFormModal from '@/components/dashboard/modals/LotFormModal'

export default function LotsView() {
  const [lots, setLots] = useState<Lot[]>([])
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })
  const [editing, setEditing] = useState<Lot | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) {
      setLots([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('lots')
      .select('*')
      .eq('user_id', uid)
      .order('purchase_date', { ascending: false })

    setLots((data ?? []) as Lot[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('vf:data-changed', handler)
    return () => window.removeEventListener('vf:data-changed', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return lots.filter((l) => {
      const dateIso = l.purchase_date ?? l.created_at
      if (!inRange(dateIso, range.from, range.to)) return false
      if (!q) return true
      const hay = `${l.name} ${l.provider ?? ''} ${(l as any).notes ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [lots, search, range])

  const kpis = useMemo(() => {
    const totalLots = filtered.length
    const totalCost = filtered.reduce((acc, l) => acc + Number(l.total_cost ?? 0), 0)
    const totalItems = filtered.reduce((acc, l) => acc + Number(l.items_count ?? 0), 0)
    const avgUnit = totalItems ? totalCost / totalItems : 0
    return { totalLots, totalCost, totalItems, avgUnit }
  }, [filtered])

  const chart = useMemo(() => {
    const now = new Date()
    const buckets: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets[monthKey(d.toISOString())] = 0
    }
    for (const l of filtered) {
      const k = monthKey(l.purchase_date ?? l.created_at)
      if (buckets[k] === undefined) continue
      buckets[k] += Number(l.total_cost ?? 0)
    }
    return Object.keys(buckets).map((k) => buckets[k])
  }, [filtered])

  async function removeLot(lot: Lot) {
    if (!confirm(`¿Eliminar lote "${lot.name}"?`)) return
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) return
    await supabase.from('lots').delete().eq('id', lot.id).eq('user_id', uid)
    window.dispatchEvent(new Event('vf:data-changed'))
  }

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4">
      <div className="grid gap-3 md:grid-cols-2 w-full min-w-0 max-w-full">
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Coste total</div>
          <div className="text-lg font-semibold">{formatCurrency(kpis.totalCost)}</div>
        </Card>
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Coste medio / prenda</div>
          <div className="text-lg font-semibold">{formatCurrency(kpis.avgUnit)}</div>
        </Card>
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Lotes</div>
          <div className="text-lg font-semibold">{kpis.totalLots}</div>
        </Card>
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Unidades</div>
          <div className="text-lg font-semibold">{kpis.totalItems}</div>
        </Card>
      </div>

      <Card className="min-w-0 max-w-full">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-medium">Compras (6m)</div>
            <div className="text-xs text-gray-500">Coste total por mes</div>
          </div>
          <div className="shrink-0">
            <MiniBars values={chart} />
          </div>
        </div>
      </Card>

      <div className="w-full min-w-0 max-w-full">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar lotes…" />
      </div>

      <DateFilter value={range} onChange={setRange} />

      {loading ? (
        <div className="grid gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hay lotes con estos filtros"
          description="Prueba a limpiar filtros o crea un lote nuevo."
          action={
            <button
              type="button"
              onClick={() => setEditing({} as Lot)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#7B1DF7] px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Añadir lote
            </button>
          }
        />
      ) : (
        filtered.map((lot) => {
          const unit = safeUnitCost(lot)
          return (
            <Card key={lot.id} className="p-0 overflow-hidden min-w-0 max-w-full">
              <div className="p-4 flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <div className="font-medium truncate">{lot.name}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {formatDate(lot.purchase_date)} · {lot.provider ?? '—'}
                  </div>
                  {(lot as any).notes && (
                    <div className="text-xs text-gray-500 mt-2 line-clamp-2">{(lot as any).notes}</div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold">{formatCurrency(Number(lot.total_cost ?? 0))}</div>
                  <div className="text-xs text-gray-500">
                    {lot.items_count ?? 0} uds · {formatCurrency(unit)}/ud
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(lot)}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                      aria-label="Editar"
                      type="button"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeLot(lot)}
                      className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-red-600"
                      aria-label="Eliminar"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })
      )}

      {editing && <LotFormModal lot={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
