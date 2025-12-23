import type { ReactNode } from 'react'

export function EmptyState({
  title,
  description,
  action
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-5 py-10 text-center shadow-[var(--shadow-xs)]">
      <div className="mx-auto max-w-md">
        <div className="text-base font-semibold text-[var(--fg)]">{title}</div>
        {description ? (
          <div className="mt-2 text-sm text-[var(--muted)]">{description}</div>
        ) : null}
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}
