'use client'

export default function Sparkline({
  values,
  height = 36
}: {
  values: number[]
  height?: number
}) {
  const w = 120
  const h = height
  const pad = 3

  const safe = values.length ? values : [0]
  const min = Math.min(...safe)
  const max = Math.max(...safe)
  const span = max - min || 1

  const points = safe
    .map((v, i) => {
      const x = pad + (i * (w - pad * 2)) / (safe.length - 1 || 1)
      const y = pad + (h - pad * 2) - ((v - min) * (h - pad * 2)) / span
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        className="text-[#7B1DF7]"
      />
    </svg>
  )
}
