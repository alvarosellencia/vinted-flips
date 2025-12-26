import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string

  /** Nuevo nombre (preferido) */
  description?: string
  /** Nombre legacy (compatibilidad) */
  subtitle?: string

  /** Nuevo nombre (preferido) */
  actions?: ReactNode
  /** Nombre legacy (compatibilidad) */
  right?: ReactNode

  className?: string
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8 min-w-0 overflow-x-clip">
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  subtitle,
  actions,
  right,
  className = '',
}: PageHeaderProps) {
  const finalDescription = description ?? subtitle
  const finalActions = actions ?? right

  return (
    <div
      className={[
        // Mobile: stack (evita overflow + saltos)
        'flex flex-col gap-3',
        // Desktop: row
        'sm:flex-row sm:items-start sm:justify-between sm:gap-4',
        'min-w-0',
        className,
      ].join(' ')}
    >
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight break-words">{title}</h1>
        {finalDescription ? (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed break-words">
            {finalDescription}
          </p>
        ) : null}
      </div>

      {finalActions ? (
        <div className="w-full sm:w-auto min-w-0">
          <div className="flex justify-start sm:justify-end">
            {finalActions}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function PageSection({ children }: { children: ReactNode }) {
  return <div className="mt-6 min-w-0 overflow-x-clip">{children}</div>
}