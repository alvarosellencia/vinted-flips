'use client'

import { useMemo } from 'react'
import { Calendar } from 'lucide-react'

export type DateRange = { from: string; to: string } // yyyy-mm-dd (o '')

export default function DateFilter({
  value,
  onChange
}: {
  value: DateRange
  onChange: (v: DateRange) => void
}) {
  const presets = useMemo(() => {
    const today = new Date()
    const iso = (d: Date) => d.toISOString().slice(0, 10)

    const minusDays = (n: number) => {
      const d = new Date()
      d.setDate(d.getDate() - n)
      return d
    }

    return [
      { label: '7d', from: iso(minusDays(7)), to: iso(today) },
      { label: '30d', from: iso(minusDays(30)), to: iso(today) },
      { label: '90d', from: iso(minusDays(90)), to: iso(today) },
      { label: 'Todo', from: '', to: '' }
    ]
  }, [])

  const chip = (active: boolean) =>
    `px-2 py-1 rounded-full text-xs border ${
      active ? 'border-[#7B1DF7] text-[#7B1DF7] bg-[#7B1DF7]/5' : 'border-gray-200 text-gray-600'
    }`

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 flex-wrap">
        {presets.map((p) => {
          const active = value.from === p.from && value.to === p.to
          return (
            <button
              key={p.label}
              onClick={() => onChange({ from: p.from, to: p.to })}
              className={chip(active)}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-gray-500 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Desde
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs text-gray-500 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Hasta
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
          />
        </label>
      </div>
    </div>
  )
}
