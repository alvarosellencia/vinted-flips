import type { Item, Lot } from './types'
import { itemCost, itemProfitIfSold, normalizeStatus, inRange } from './utils'

export type PeriodMode = 'all' | 'month' | 'last30' | 'custom'

export type Metrics = {
  revenue: number
  profit: number
  soldCount: number
  totalCount: number
  forSaleCount: number
  reservedCount: number
  returnedCount: number
}

export function computeMetrics(
  items: Item[],
  lots: Lot[],
  opts?: { mode?: PeriodMode; from?: string; to?: string }
): Metrics {
  const mode = opts?.mode ?? 'all'
  const now = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)

  let from = opts?.from ?? ''
  let to = opts?.to ?? ''

  if (mode === 'last30') {
    const d = new Date(now)
    d.setDate(d.getDate() - 30)
    from = iso(d)
    to = iso(now)
  } else if (mode === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    from = iso(start)
    to = iso(end)
  }

  const lotMap = new Map(lots.map((l) => [l.id, l]))

  let revenue = 0
  let profit = 0
  let soldCount = 0
  let totalCount = 0
  let forSaleCount = 0
  let reservedCount = 0
  let returnedCount = 0

  for (const it of items) {
    // filtro por rango usando: sale_date o publish_date o created_at
    const dateIso = it.sale_date ?? it.publish_date ?? it.created_at
    if (!inRange(dateIso, from, to)) continue

    totalCount++
    const s = normalizeStatus(it.status)
    if (s === 'for_sale') forSaleCount++
    if (s === 'reserved') reservedCount++
    if (s === 'returned') returnedCount++

    if (s === 'sold') {
      soldCount++
      const sale = Number(it.sale_price ?? 0)
      const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
      const cost = itemCost(it, lot)
      revenue += sale
      profit += itemProfitIfSold(it, cost) ?? 0
    }
  }

  return {
    revenue,
    profit,
    soldCount,
    totalCount,
    forSaleCount,
    reservedCount,
    returnedCount
  }
}
