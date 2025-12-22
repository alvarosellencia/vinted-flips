'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Lot } from '@/lib/types'
import Card from '@/components/ui/Card'
import SearchInput from '@/components/ui/SearchInput'
import { formatCurrency, formatDate, safeUnitCost } from '@/lib/utils'

export default function LotsView() {
  const [lots, setLots] = useState<Lot[]>([])
  const [search, setSearch] = useState('')

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) return

    const { data } = await supabase
      .from('lots')
      .select('*')
      .eq('user_id', uid)
      .order('purchase_date', { ascending: false })

    setLots((data ?? []) as Lot[])
  }

  useEffect(() => {
    load()
    const handler = () => load()
    window.addEventListener('vf:data-changed', handler)
    return () => window.removeEventListener('vf:data-changed', handler)
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return lots
    return lots.filter((l) => {
      const hay =
        `${l.name} ${l.provider ?? ''} ${l.notes ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [lots, search])

  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar lotes…" />

      {filtered.length === 0 && (
        <div className="text-sm text-gray-500">No hay lotes.</div>
      )}

      {filtered.map((lot) => {
        const unit = safeUnitCost(lot)
        return (
          <Card key={lot.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{lot.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(lot.purchase_date)} · {lot.provider ?? '—'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{formatCurrency(Number(lot.total_cost ?? 0))}</div>
                <div className="text-xs text-gray-500">
                  {lot.items_count ?? 0} uds · {formatCurrency(unit)}/ud
                </div>
              </div>
            </div>

            {lot.notes && (
              <div className="text-xs text-gray-500 mt-3">{lot.notes}</div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
