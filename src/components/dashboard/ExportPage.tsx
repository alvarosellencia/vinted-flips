'use client'

import { useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'

type Row = Record<string, unknown>

function escapeCsv(v: unknown) {
  if (v === null || v === undefined) return ''
  const s =
    typeof v === 'string'
      ? v
      : typeof v === 'number' || typeof v === 'boolean'
        ? String(v)
        : JSON.stringify(v)

  // Si contiene separador, comillas o saltos de línea => entrecomillar y escapar comillas
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows: Row[]) {
  if (!rows.length) return 'id\n' // algo mínimo

  const cols = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k))
      return acc
    }, new Set<string>())
  )

  const header = cols.join(';')
  const lines = rows.map((r) => cols.map((c) => escapeCsv((r as any)[c])).join(';'))
  return [header, ...lines].join('\n')
}

function download(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const [loading, setLoading] = useState<'lots' | 'items' | null>(null)

  const hint = useMemo(
    () => 'Exporta tus lotes o prendas en CSV (separador ;) listo para Excel/Sheets.',
    []
  )

  async function exportLots() {
    setLoading('lots')
    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) return alert('No hay sesión.')

      const { data, error } = await supabase.from('lots').select('*').eq('user_id', uid)
      if (error) throw error

      const csv = toCsv(((data ?? []) as Row[]))
      download(`vinted-flips_lots_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    } catch (e: any) {
      alert(e?.message ?? 'Error exportando lotes')
    } finally {
      setLoading(null)
    }
  }

  async function exportItems() {
    setLoading('items')
    try {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData.user?.id
      if (!uid) return alert('No hay sesión.')

      const { data, error } = await supabase.from('items').select('*').eq('user_id', uid)
      if (error) throw error

      const csv = toCsv(((data ?? []) as Row[]))
      download(`vinted-flips_items_${new Date().toISOString().slice(0, 10)}.csv`, csv)
    } catch (e: any) {
      alert(e?.message ?? 'Error exportando prendas')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm font-medium">Export</div>
        <div className="text-xs text-gray-500 mt-1">{hint}</div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={exportLots}
          disabled={loading !== null}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          {loading === 'lots' ? 'Exportando lotes…' : 'Exportar lotes'}
        </button>

        <button
          onClick={exportItems}
          disabled={loading !== null}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          {loading === 'items' ? 'Exportando prendas…' : 'Exportar prendas'}
        </button>
      </div>
    </div>
  )
}