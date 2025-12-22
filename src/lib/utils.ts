import type { Item, ItemStatusDb, Lot } from '@/lib/types'

export function formatCurrency(n: number) {
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(2)} €`
}

export function formatDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-ES')
}

export function monthKey(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function normalizeStatus(raw: any): ItemStatusDb {
  const v = String(raw ?? '').toLowerCase().trim()

  // ya en DB
  if (v === 'for_sale') return 'for_sale'
  if (v === 'sold') return 'sold'
  if (v === 'reserved') return 'reserved'
  if (v === 'returned') return 'returned'

  // legacy / español
  if (v === 'en venta' || v === 'venta') return 'for_sale'
  if (v === 'vendida' || v === 'vendido') return 'sold'
  if (v === 'reservada' || v === 'reservado') return 'reserved'
  if (v === 'devuelta' || v === 'devuelto') return 'returned'

  return 'for_sale'
}

export function statusLabel(s: ItemStatusDb) {
  if (s === 'for_sale') return 'en venta'
  if (s === 'sold') return 'vendida'
  if (s === 'reserved') return 'reservada'
  return 'devuelta'
}

export function itemDisplayName(item: Item) {
  return (item.name ?? item.title ?? '').trim() || 'Sin nombre'
}

export function safeUnitCost(lot: Lot | undefined) {
  if (!lot) return 0
  const total = Number(lot.total_cost ?? 0)
  const count = Number(lot.items_count ?? 0)
  if (!count) return 0
  return total / count
}

export function itemCost(item: Item, lot?: Lot) {
  const direct = item.purchase_cost
  if (direct !== null && direct !== undefined) return Number(direct) || 0
  return safeUnitCost(lot)
}

export function itemProfitIfSold(item: Item, cost: number) {
  if (normalizeStatus(item.status) !== 'sold') return null
  const sale = Number(item.sale_price ?? 0)
  return sale - cost
}

export function inRange(iso: string | null, from: string, to: string) {
  if (!from && !to) return true
  if (!iso) return false
  const d = iso.slice(0, 10)
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}
