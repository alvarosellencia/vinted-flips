export type ItemStatusDb = 'for_sale' | 'sold' | 'reserved' | 'returned'

export type Lot = {
  id: string
  user_id: string
  name: string
  purchase_date: string | null
  items_count: number | null
  total_cost: number | null
  provider: string | null
  // notes puede o no existir en tu DB (lo tratamos como any donde haga falta)
  created_at: string
  updated_at: string | null
}

export type Item = {
  id: string
  user_id: string
  lot_id: string | null
  lot_name: string | null
  name: string | null
  title: string | null
  status: string // en tu DB puede venir for_sale/sold... o valores antiguos
  size: string | null
  purchase_cost: number | null
  sale_price: number | null
  sale_date: string | null
  publish_date: string | null
  platform: string | null
  // notes puede o no existir
  created_at: string
  updated_at: string | null
}
