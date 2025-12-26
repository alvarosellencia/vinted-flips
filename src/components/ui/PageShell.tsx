import type { ReactNode } from 'react'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip">
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          ) : null}
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  )
}

export function PageSection({
  title,
  subtitle,
  children,
}: {
  title?: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-x-clip">
      {title ? (
        <div className="mb-3">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {subtitle ? (
            <div className="mt-0.5 text-xs text-gray-500">{subtitle}</div>
          ) : null}
        </div>
      ) : null}

      {children}
    </section>
  )
}