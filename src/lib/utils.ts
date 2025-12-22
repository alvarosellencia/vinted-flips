import type { Item, Lot } from '@/lib/types'

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

export function safeUnitCost(lot: Lot | undefined) {
  if (!lot) return 0
  const total = Number(lot.total_cost ?? 0)
  const count = Number(lot.items_count ?? 0)
  if (!count) return 0
  return total / count
}

export function itemDisplayName(item: Item) {
  return (item.name ?? item.title ?? '').trim() || 'Sin nombre'
}

export function itemCost(item: Item, lot?: Lot) {
  const direct = item.purchase_cost
  if (direct !== null && direct !== undefined) return Number(direct) || 0
  return safeUnitCost(lot)
}

export function itemProfitIfSold(item: Item, cost: number) {
  if (item.status !== 'vendida') return null
  const sale = Number(item.sale_price ?? 0)
  return sale - cost
}
