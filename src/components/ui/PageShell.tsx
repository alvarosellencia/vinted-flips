import type { ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--fg)]">
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">{children}</div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  right
}: {
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 pt-6 md:pt-10">
      <div className="min-w-0">
        <h1 className="text-[22px] md:text-[28px] font-semibold tracking-tight text-[var(--fg)] truncate">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  )
}

export function PageSection({ children }: { children: ReactNode }) {
  return <section className="mt-5 md:mt-7">{children}</section>
}
