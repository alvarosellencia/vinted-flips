'use client'

import { useMemo } from 'react'
import { Calendar } from 'lucide-react'

export type DateRange = { from: string; to: string }

type Props = {
  value: DateRange
  onChange: (next: DateRange) => void
}

type Preset = { key: '7d' | '30d' | '90d' | 'all'; label: string; days?: number }

const presets: Preset[] = [
  { key: '7d', label: '7d', days: 7 },
  { key: '30d', label: '30d', days: 30 },
  { key: '90d', label: '90d', days: 90 },
  { key: 'all', label: 'Todo' },
]

function isoDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function DateFilter({ value, onChange }: Props) {
  const activePreset = useMemo(() => {
    if (!value.from && !value.to) return 'all'
    return null
  }, [value.from, value.to])

  const chipClass = (active: boolean) =>
    `px-3 py-2 rounded-full text-sm border transition whitespace-nowrap ${
      active
        ? 'border-[#7B1DF7] text-[#7B1DF7] bg-[#7B1DF7]/5'
        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
    }`

  const inputClass =
    'w-full min-w-0 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#7B1DF7]/20 focus:border-[#7B1DF7]'

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip">
      {/* Presets */}
      <div className="w-full min-w-0 max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch] pb-1">
        <div className="flex gap-2 min-w-0">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              className={chipClass(activePreset === p.key)}
              onClick={() => {
                if (p.key === 'all') {
                  onChange({ from: '', to: '' })
                  return
                }
                const now = new Date()
                const to = isoDate(now)
                const from = isoDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (p.days ?? 0)))
                onChange({ from, to })
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full min-w-0 max-w-full">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="text-sm text-gray-600 shrink-0">Desde</div>
          <input
            className={inputClass}
            type="date"
            value={value.from ?? ''}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="text-sm text-gray-600 shrink-0">Hasta</div>
          <input
            className={inputClass}
            type="date"
            value={value.to ?? ''}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
