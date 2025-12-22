'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { exportToCSV } from '@/lib/csv'
import type { Item, Lot } from '@/lib/types'
import { itemCost, itemProfitIfSold, itemDisplayName, safeUnitCost, normalizeStatus } from '@/lib/utils'

type LastTab = 'lots' | 'items' | null

export default function Page() {
  const [lastTab, setLastTab] = useState<LastTab>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const v = localStorage.getItem('vf:lastTab')
    if (v === 'lots' || v === 'items') setLastTab(v)
  }, [])

  async function exportCurrent() {
    if (!lastTab) return
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) return

      if (lastTab === 'lots') {
        const { data } = await supabase.from('lots').select('*').eq('user_id', uid)
        const lots = (data ?? []) as Lot[]
        exportToCSV(
          'lotes.csv',
          lots.map((l) => ({
            id: l.id,
            name: l.name,
            purchase_date: l.purchase_date,
            items_count: l.items_count,
            total_cost: l.total_cost,
            unit_cost: safeUnitCost(l),
            provider: l.provider ?? '',
            notes: (l as any).notes ?? ''
          }))
        )
      }

      if (lastTab === 'items') {
        const [{ data: lotsData }, { data: itemsData }] = await Promise.all([
          supabase.from('lots').select('*').eq('user_id', uid),
          supabase.from('items').select('*').eq('user_id', uid)
        ])

        const lots = (lotsData ?? []) as Lot[]
        const items = (itemsData ?? []) as Item[]
        const lotMap = new Map(lots.map((l) => [l.id, l]))

        exportToCSV(
          'prendas.csv',
          items.map((it) => {
            const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
            const cost = itemCost(it, lot)
            const profit = itemProfitIfSold(it, cost)
            return {
              id: it.id,
              name: itemDisplayName(it),
              status: normalizeStatus(it.status),
              size: it.size ?? '',
              lot: lot?.name ?? it.lot_name ?? '',
              cost,
              sale_price: it.sale_price ?? '',
              profit: profit ?? '',
              platform: it.platform ?? '',
              notes: (it as any).notes ?? ''
            }
          })
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-6 px-4 md:px-0 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Export</h1>

      {!lastTab && (
        <div className="text-sm text-gray-500">
          Ve a <b>Lotes</b> o <b>Prendas</b>. Aquí solo se exporta la pestaña actual.
        </div>
      )}

      {lastTab && (
        <button
          onClick={exportCurrent}
          disabled={loading}
          className="w-full rounded-2xl bg-[#7B1DF7] text-white py-3 text-sm font-medium shadow-sm disabled:opacity-60"
        >
          {loading ? 'Exportando…' : `Exportar ${lastTab === 'lots' ? 'lotes' : 'prendas'} (CSV)`}
        </button>
      )}
    </div>
  )
}
