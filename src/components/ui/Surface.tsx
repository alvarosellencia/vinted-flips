import type { ReactNode } from 'react'

export function Surface({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]',
        className
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function SurfaceHeader({
  title,
  right
}: {
  title: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4">
      <div className="text-sm font-semibold text-[var(--fg)]">{title}</div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

export function SurfaceBody({ children }: { children: ReactNode }) {
  return <div className="px-4 pb-4 md:px-5 md:pb-5">{children}</div>
}
