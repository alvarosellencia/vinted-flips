'use client'

export default function MiniBars({
  values
}: {
  values: number[]
}) {
  const safe = values.length ? values : [0]
  const max = Math.max(...safe) || 1

  return (
    <div className="flex items-end gap-1 h-10">
      {safe.map((v, idx) => {
        const pct = Math.max(0, (v / max) * 100)
        return (
          <div
            key={idx}
            className="w-2 rounded-full bg-[#7B1DF7]/30"
            style={{ height: `${pct}%` }}
          />
        )
      })}
    </div>
  )
}
