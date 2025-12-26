'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'

type Row = Record<string, any>

function escapeCell(value: unknown, delimiter: string) {
  const s =
    value === null || value === undefined
      ? ''
      : typeof value === 'string'
        ? value
        : typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : JSON.stringify(value)

  // Escapar si contiene comillas, saltos de línea o el delimitador
  return new RegExp(`[",\\n\\r${delimiter}]`).test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function toCsv(rows: Row[], delimiter: string = ';') {
  const safeRows = Array.isArray(rows) ? rows : []

  // Columnas: unión de todas las keys, sin reventar si hay filas raras
  const cols = Array.from(
    safeRows.reduce<Set<string>>((set, r) => {
      if (r && typeof r === 'object') Object.keys(r).forEach((k) => set.add(k))
      return set
    }, new Set<string>())
  )

  if (cols.length === 0) return ''

  const header = cols.join(delimiter)
  const lines = safeRows.map((r) => cols.map((c) => escapeCell(r?.[c], delimiter)).join(delimiter))
  return [header, ...lines].join('\n')
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
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
  const [loading, setLoading] = useState<null | 'items' | 'lots'>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastOk, setLastOk] = useState<string | null>(null)

  async function exportTable(table: 'items' | 'lots') {
    try {
      setError(null)
      setLastOk(null)
      setLoading(table)

      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (userErr) throw userErr
      const uid = userData.user?.id
      if (!uid) throw new Error('No hay usuario autenticado.')

      const { data, error: qErr } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      if (qErr) throw qErr

      const rows = (data ?? []) as Row[]
      const csv = toCsv(rows, ';')

      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      downloadText(`${table}-${stamp}.csv`, csv)

      setLastOk(`Export correcto: ${table} (${rows.length} filas)`)
    } catch (e: any) {
      setError(e?.message ?? 'Error exportando.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">Export CSV</div>
            <div className="text-xs text-gray-500 mt-1">
              Exporta tus tablas desde Supabase (filtradas por tu usuario).
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => exportTable('lots')}
            disabled={loading !== null}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {loading === 'lots' ? 'Exportando Lotes…' : 'Exportar Lotes'}
          </button>

          <button
            onClick={() => exportTable('items')}
            disabled={loading !== null}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {loading === 'items' ? 'Exportando Prendas…' : 'Exportar Prendas'}
          </button>
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        {lastOk && <div className="mt-3 text-sm text-green-700">{lastOk}</div>}
      </Card>

      <div className="text-xs text-gray-500">
        Nota: el CSV se genera con separador <span className="font-medium">;</span> para compatibilidad con Excel en ES.
      </div>
    </div>
  )
}
