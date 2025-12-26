'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Item, ItemStatusDb, Lot } from '@/lib/types'
import Card from '@/components/ui/Card'
import SearchInput from '@/components/ui/SearchInput'
import DateFilter, { DateRange } from '@/components/dashboard/DateFilter'
import Sparkline from '@/components/charts/Sparkline'
import Chip from '@/components/ui/Chip'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import {
  formatCurrency,
  itemCost,
  itemProfitIfSold,
  itemDisplayName,
  inRange,
  monthKey,
  normalizeStatus,
} from '@/lib/utils'
import { Pencil, Trash2, Plus } from 'lucide-react'
import ItemFormModal from '@/components/dashboard/modals/ItemFormModal'

const statusFilters: { key: ItemStatusDb | 'all'; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'for_sale', label: 'En venta' },
  { key: 'reserved', label: 'Reservadas' },
  { key: 'sold', label: 'Vendidas' },
  { key: 'returned', label: 'Devueltas' },
]

export default function ItemsView() {
  const [items, setItems] = useState<Item[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<DateRange>({ from: '', to: '' })
  const [filter, setFilter] = useState<ItemStatusDb | 'all'>('all')
  const [editing, setEditing] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) {
      setItems([])
      setLots([])
      setLoading(false)
      return
    }

    const [{ data: lotsData }, { data: itemsData }] = await Promise.all([
      supabase.from('lots').select('*').eq('user_id', uid),
      supabase.from('items').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
    ])

    setLots((lotsData ?? []) as Lot[])
    setItems((itemsData ?? []) as Item[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('vf:data-changed', handler)
    return () => window.removeEventListener('vf:data-changed', handler)
  }, [])

  const lotMap = useMemo(() => new Map(lots.map((l) => [l.id, l])), [lots])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((it) => {
      const status = normalizeStatus(it.status)
      if (filter !== 'all' && status !== filter) return false
      const dateIso = it.sale_date ?? it.publish_date ?? it.created_at
      if (!inRange(dateIso, range.from, range.to)) return false
      if (!q) return true

      const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
      const lotName = lot?.name ?? it.lot_name ?? ''
      const hay = `${itemDisplayName(it)} ${status} ${it.size ?? ''} ${lotName} ${it.platform ?? ''} ${(it as any).notes ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, search, range, filter, lotMap])

  const kpis = useMemo(() => {
    let revenue = 0
    let profit = 0
    for (const it of filtered) {
      const s = normalizeStatus(it.status)
      if (s === 'sold') {
        const sale = Number(it.sale_price ?? 0)
        const cost = itemCost(it, it.lot_id ? lotMap.get(it.lot_id) : undefined)
        revenue += sale
        profit += itemProfitIfSold(it, cost) ?? 0
      }
    }
    return { revenue, profit, total: filtered.length }
  }, [filtered, lotMap])

  const chart = useMemo(() => {
    const now = new Date()
    const buckets: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets[monthKey(d.toISOString())] = 0
    }

    for (const it of filtered) {
      if (normalizeStatus(it.status) !== 'sold') continue
      const k = monthKey(it.sale_date ?? it.created_at)
      if (buckets[k] === undefined) continue
      const cost = itemCost(it, it.lot_id ? lotMap.get(it.lot_id) : undefined)
      buckets[k] += itemProfitIfSold(it, cost) ?? 0
    }

    return Object.keys(buckets).map((k) => buckets[k])
  }, [filtered, lotMap])

  async function removeItem(it: Item) {
    if (!confirm(`¿Eliminar "${itemDisplayName(it)}"?`)) return
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) return
    await supabase.from('items').delete().eq('id', it.id).eq('user_id', uid)
    window.dispatchEvent(new Event('vf:data-changed'))
  }

  const chip = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm border transition whitespace-nowrap ${
      active ? 'border-[#7B1DF7] text-[#7B1DF7] bg-[#7B1DF7]/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
    }`

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4">
      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-3 w-full min-w-0 max-w-full">
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Ingresos (filtrado)</div>
          <div className="text-lg font-semibold">{formatCurrency(kpis.revenue)}</div>
        </Card>
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Beneficio (filtrado)</div>
          <div className={`text-lg font-semibold ${kpis.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(kpis.profit)}
          </div>
        </Card>
        <Card className="min-w-0 max-w-full">
          <div className="text-xs text-gray-500">Prendas (filtrado)</div>
          <div className="text-lg font-semibold">{kpis.total}</div>
        </Card>
      </div>

      {/* Chart */}
      <Card className="min-w-0 max-w-full">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-medium">Beneficio (6m)</div>
            <div className="text-xs text-gray-500">Solo vendidas, según filtros</div>
          </div>
          <div className="shrink-0">
            <Sparkline values={chart} />
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
        <div className="flex gap-2 min-w-0">
          {statusFilters.map((s) => (
            <button key={s.key} onClick={() => setFilter(s.key)} className={chip(filter === s.key)} type="button">
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full min-w-0 max-w-full">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar prendas…" />
      </div>

      <DateFilter value={range} onChange={setRange} />

      {/* Content */}
      {loading ? (
        <div className="grid gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No hay prendas con estos filtros"
          description="Prueba a limpiar filtros o añade una prenda nueva."
          action={
            <button
              type="button"
              onClick={() => setEditing({} as Item)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#7B1DF7] px-4 py-2.5 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              Añadir prenda
            </button>
          }
        />
      ) : (
        filtered.map((it) => {
          const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
          const cost = itemCost(it, lot)
          const profit = itemProfitIfSold(it, cost)
          const lotName = lot?.name ?? it.lot_name ?? '—'
          const status = normalizeStatus(it.status)

          return (
            <Card key={it.id} className="p-0 overflow-hidden min-w-0 max-w-full">
              <div className="p-4 min-w-0">
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{itemDisplayName(it)}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      Talla {it.size ?? '—'} · Lote {lotName}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Chip status={status} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs min-w-0">
                  <div className="min-w-0">
                    <div className="text-gray-500">Coste</div>
                    <div className="font-medium truncate">{formatCurrency(cost)}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">Venta</div>
                    <div className="font-medium truncate">{it.sale_price ? formatCurrency(Number(it.sale_price)) : '—'}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500">Beneficio</div>
                    <div className={`font-semibold truncate ${profit === null ? 'text-gray-400' : profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {profit === null ? '—' : formatCurrency(profit)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditing(it)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                    aria-label="Editar"
                    type="button"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeItem(it)}
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-red-600"
                    aria-label="Eliminar"
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          )
        })
      )}

      {editing && <ItemFormModal item={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
