'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Item, Lot } from '@/lib/types'
import Card from '@/components/ui/Card'
import Sparkline from '@/components/charts/Sparkline'
import MiniBars from '@/components/charts/MiniBars'
import { formatCurrency, monthKey, itemCost, itemProfitIfSold, normalizeStatus } from '@/lib/utils'

export default function SummaryView() {
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

  const lotMap = useMemo(() => new Map(lots.map((l) => [l.id, l])), [lots])

  const derived = useMemo(() => {
    const sold = items.filter((it) => normalizeStatus(it.status) === 'sold')

    let revenue = 0
    let profit = 0
    for (const it of sold) {
      const sale = Number(it.sale_price ?? 0)
      const cost = itemCost(it, it.lot_id ? lotMap.get(it.lot_id) : undefined)
      revenue += sale
      profit += itemProfitIfSold(it, cost) ?? 0
    }

    // last 6 months series
    const series: Record<string, { rev: number; prof: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      series[monthKey(d.toISOString())] = { rev: 0, prof: 0 }
    }

    for (const it of sold) {
      const date = it.sale_date ?? it.created_at
      const k = monthKey(date)
      if (!series[k]) continue
      const sale = Number(it.sale_price ?? 0)
      const cost = itemCost(it, it.lot_id ? lotMap.get(it.lot_id) : undefined)
      series[k].rev += sale
      series[k].prof += itemProfitIfSold(it, cost) ?? 0
    }

    const labels = Object.keys(series)
    const revValues = labels.map((k) => series[k].rev)
    const profValues = labels.map((k) => series[k].prof)

    // status distribution
    const dist = { for_sale: 0, reserved: 0, sold: 0, returned: 0 }
    for (const it of items) dist[normalizeStatus(it.status)]++

    return {
      revenue,
      profit,
      soldCount: sold.length,
      totalCount: items.length,
      revValues,
      profValues,
      distValues: [dist.for_sale, dist.reserved, dist.sold, dist.returned]
    }
  }, [items, lotMap])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Resumen</h1>
      <p className="text-sm text-gray-500">
        El export CSV solo funciona desde <b>Lotes</b> o <b>Prendas</b>.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-gray-500">Ingresos</div>
          <div className="text-lg font-semibold">{formatCurrency(derived.revenue)}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Beneficio</div>
          <div className={`text-lg font-semibold ${derived.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(derived.profit)}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Vendidas</div>
          <div className="text-lg font-semibold">{derived.soldCount}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Total prendas</div>
          <div className="text-lg font-semibold">{derived.totalCount}</div>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Ingresos (6m)</div>
              <div className="text-xs text-gray-500">Tendencia</div>
            </div>
            <Sparkline values={derived.revValues} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Beneficio (6m)</div>
              <div className="text-xs text-gray-500">Tendencia</div>
            </div>
            <Sparkline values={derived.profValues} />
          </div>
        </Card>

        <Card className="md:col-span-2">
          <div className="text-sm font-medium">Distribución de estados</div>
          <div className="text-xs text-gray-500">En venta · Reservada · Vendida · Devuelta</div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <MiniBars values={derived.distValues} />
            <div className="text-xs text-gray-600">
              <div>En venta: <b>{derived.distValues[0]}</b></div>
              <div>Reservada: <b>{derived.distValues[1]}</b></div>
              <div>Vendida: <b>{derived.distValues[2]}</b></div>
              <div>Devuelta: <b>{derived.distValues[3]}</b></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
