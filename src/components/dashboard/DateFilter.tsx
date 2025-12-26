'use client'

import { useEffect, useMemo, useState } from 'react'

export type DateRange = { from: string; to: string }

export default function DateFilter({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (v: DateRange) => void
}) {
  const [quick, setQuick] = useState<'7d' | '30d' | '90d' | 'all' | 'custom'>('all')

  // Helper: YYYY-MM-DD (input type="date")
  const toDateInput = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const is7 = quick === '7d'
  const is30 = quick === '30d'
  const is90 = quick === '90d'
  const isAll = quick === 'all'

  const chip = (active: boolean) =>
    `px-3 py-1 rounded-full text-sm border transition ${
      active
        ? 'border-[#7B1DF7] text-[#7B1DF7] bg-[#7B1DF7]/5'
        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
    }`

  // Si el usuario toca fechas manualmente, pasamos a "custom"
  useEffect(() => {
    if ((value.from || value.to) && quick !== 'custom') setQuick('custom')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.from, value.to])

  const applyQuick = (mode: '7d' | '30d' | '90d' | 'all') => {
    setQuick(mode)

    if (mode === 'all') {
      onChange({ from: '', to: '' })
      return
    }

    const now = new Date()
    const days = mode === '7d' ? 7 : mode === '30d' ? 30 : 90
    const from = new Date(now)
    from.setDate(now.getDate() - days)

    onChange({
      from: toDateInput(from),
      to: toDateInput(now),
    })
  }

  const rangeLabel = useMemo(() => {
    if (quick === 'all') return 'Todo'
    if (quick === '7d') return '7d'
    if (quick === '30d') return '30d'
    if (quick === '90d') return '90d'
    return 'Custom'
  }, [quick])

  return (
    <div className="w-full max-w-full">
      {/* Quick buttons */}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip(is7)} onClick={() => applyQuick('7d')}>
          7d
        </button>
        <button type="button" className={chip(is30)} onClick={() => applyQuick('30d')}>
          30d
        </button>
        <button type="button" className={chip(is90)} onClick={() => applyQuick('90d')}>
          90d
        </button>
        <button type="button" className={chip(isAll)} onClick={() => applyQuick('all')}>
          Todo
        </button>

        {/* Etiqueta pequeña para debug visual (opcional) */}
        <span className="ml-auto text-xs text-gray-400 self-center">Filtro: {rangeLabel}</span>
      </div>

      {/* Dates (IMPORTANT: stack in mobile to avoid overflow) */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <label className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-500 shrink-0">Desde</span>
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1DF7]/30"
          />
        </label>

        <label className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-gray-500 shrink-0">Hasta</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="min-w-0 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1DF7]/30"
          />
        </label>
      </div>
    </div>
  )
}