'use client'

import { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Item, Lot } from '@/lib/types'
import Card from '@/components/ui/Card'
import { formatCurrency, itemCost, itemProfitIfSold, itemDisplayName, normalizeStatus } from '@/lib/utils'

type Mode = 'items' | 'lots'

function toCsv(rows: Record<string, any>[]) {
  const escape = (v: any) => {
    const s = String(v ?? '')
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const cols = Array.from(rows.reduce((set, r) => (Object.keys(r).forEach((k) => set.add(k)), set), new Set<string>()))
  const header = cols.join(';')
  const lines = rows.map((r) => cols.map((c) => escape(r[c])).join(';'))
  return [header, ...lines].join('\n')
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const [mode, setMode] = useState<Mode>('items')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function runExport() {
    setLoading(true)
    setMsg(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) {
        setMsg('No hay sesión activa.')
        return
      }

      if (mode === 'lots') {
        const { data } = await supabase.from('lots').select('*').eq('user_id', uid).order('purchase_date', { ascending: false })
        const lots = (data ?? []) as Lot[]
        const rows = lots.map((l) => ({
          id: l.id,
          name: l.name,
          purchase_date: l.purchase_date,
          provider: l.provider,
          total_cost: l.total_cost,
          items_count: l.items_count,
          unit_cost: l.items_count ? Number(l.total_cost ?? 0) / Number(l.items_count ?? 0) : 0,
          created_at: l.created_at,
          user_id: l.user_id
        }))
        downloadCsv(`lotes_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
        setMsg(`Exportados ${rows.length} lotes.`)
      } else {
        const [{ data: lotsData }, { data: itemsData }] = await Promise.all([
          supabase.from('lots').select('*').eq('user_id', uid),
          supabase.from('items').select('*').eq('user_id', uid).order('created_at', { ascending: false })
        ])
        const lots = (lotsData ?? []) as Lot[]
        const lotMap = new Map(lots.map((l) => [l.id, l]))
        const items = (itemsData ?? []) as Item[]

        const rows = items.map((it) => {
          const lot = it.lot_id ? lotMap.get(it.lot_id) : undefined
          const cost = itemCost(it, lot)
          const profit = itemProfitIfSold(it, cost)
          const status = normalizeStatus(it.status)

          return {
            id: it.id,
            name: itemDisplayName(it),
            status,
            size: it.size,
            platform: it.platform,
            lot_id: it.lot_id,
            lot_name: lot?.name ?? it.lot_name,
            cost,
            sale_price: it.sale_price,
            profit: profit ?? '',
            publish_date: it.publish_date,
            sale_date: it.sale_date,
            created_at: it.created_at,
            user_id: it.user_id
          }
        })

        downloadCsv(`prendas_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
        setMsg(`Exportadas ${rows.length} prendas.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-medium">Export CSV</div>
        <div className="text-xs text-gray-500 mt-1">Elige qué exportar. Se descarga en CSV con separador “;”.</div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            className={`px-3 py-2 rounded-xl text-sm border ${mode === 'items' ? 'border-[#7B1DF7] text-[#7B1DF7] bg-[#7B1DF7]/5' : 'border-gray-200 text-gray-700'}`}
            onClick={() => setMode('items')}
          >
            Prendas
          </button>
          <button
            className={`px-3 py-2 rounded-xl text-sm border ${mode === 'lots' ? 'border-[#7B1DF7] text-[#7B1DF7] bg-[#7B1DF7]/5' : 'border-gray-200 text-gray-700'}`}
            onClick={() => setMode('lots')}
          >
            Lotes
          </button>

          <div className="flex-1" />

          <button
            onClick={runExport}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[#7B1DF7] text-white text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Exportando…' : 'Descargar CSV'}
          </button>
        </div>

        {msg && <div className="mt-3 text-xs text-gray-600">{msg}</div>}
      </Card>
    </div>
  )
}
