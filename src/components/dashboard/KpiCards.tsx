'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/ui/Card'
import { supabase } from '@/lib/supabase/client'
import type { Item, Lot } from '@/lib/types'
import { formatCurrency, itemCost, itemProfitIfSold } from '@/lib/utils'

export default function KpiCards() {
  const [items, setItems] = useState<Item[]>([])
  const [lots, setLots] = useState<Lot[]>([])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) return

    const [{ data: lotsData }, { data: itemsData }] = await Promise.all([
      supabase.from('lots').select('*').eq('user_id', uid),
      supabase.from('items').select('*').eq('user_id', uid)
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

  const { revenue, profit, soldCount, totalCount } = useMemo(() => {
    const lotMap = new Map(lots.map((l) => [l.id, l]))

    let revenue = 0
    let profit = 0
    let soldCount = 0

    for (const it of items) {
      if (it.status === 'vendida') {
        soldCount++
        const sale = Number(it.sale_price ?? 0)
        const cost = itemCost(it, it.lot_id ? lotMap.get(it.lot_id) : undefined)
        revenue += sale
        const p = itemProfitIfSold(it, cost) ?? 0
        profit += p
      }
    }

    return { revenue, profit, soldCount, totalCount: items.length }
  }, [items, lots])

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <div className="text-xs text-gray-500">Ingresos</div>
        <div className="text-lg font-semibold">{formatCurrency(revenue)}</div>
      </Card>
      <Card>
        <div className="text-xs text-gray-500">Beneficio</div>
        <div className={`text-lg font-semibold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
          {formatCurrency(profit)}
        </div>
      </Card>
      <Card>
        <div className="text-xs text-gray-500">Vendidas</div>
        <div className="text-lg font-semibold">{soldCount}</div>
      </Card>
      <Card>
        <div className="text-xs text-gray-500">Total prendas</div>
        <div className="text-lg font-semibold">{totalCount}</div>
      </Card>
    </div>
  )
}
