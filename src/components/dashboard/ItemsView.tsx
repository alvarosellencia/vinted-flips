'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Item, Lot } from '@/lib/types'
import Card from '@/components/ui/Card'
import SearchInput from '@/components/ui/SearchInput'
import Chip from '@/components/ui/Chip'
import { formatCurrency, itemCost, itemProfitIfSold, itemDisplayName } from '@/lib/utils'

export default function ItemsView() {
  const [items, setItems] = useState<Item[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [search, setSearch] = useState('')

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) return

    const [{ data: lotsData }, { data: itemsData }] = await Promise.all([
      supabase.from('lots').select('*').eq('user_id', uid),
      supabase.from('items').select('*').eq('user_id', uid).order('created_at', { ascending: false })
    ])

    setLots((lotsData ?? []) as Lot[])
    setItems((itemsData ?? []) as Item[])
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
    if (!q) return items
    return items.filter((it) => {
      const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
      const lotName = lot?.name ?? it.lot_name ?? ''
      const hay = `${itemDisplayName(it)} ${it.status} ${it.size ?? ''} ${lotName} ${it.platform ?? ''} ${it.notes ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [items, search, lotMap])

  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar prendas…" />

      {filtered.length === 0 && (
        <div className="text-sm text-gray-500">No hay prendas.</div>
      )}

      {filtered.map((it) => {
        const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
        const cost = itemCost(it, lot)
        const profit = itemProfitIfSold(it, cost)
        const lotName = lot?.name ?? it.lot_name ?? '—'

        return (
          <Card key={it.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{itemDisplayName(it)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Talla {it.size ?? '—'} · Lote {lotName}
                </div>
              </div>
              <Chip status={it.status} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Coste</div>
                <div className="font-medium">{formatCurrency(cost)}</div>
              </div>
              <div>
                <div className="text-gray-500">Venta</div>
                <div className="font-medium">{it.sale_price ? formatCurrency(Number(it.sale_price)) : '—'}</div>
              </div>
              <div>
                <div className="text-gray-500">Beneficio</div>
                <div className={`font-semibold ${profit === null ? 'text-gray-400' : profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {profit === null ? '—' : formatCurrency(profit)}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
