'use client'

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
    <div className="mx-auto w-full max-w-[1100px] px-4 sm:px-6 lg:px-8">
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
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
        {finalDescription ? (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{finalDescription}</p>
        ) : null}
      </div>

      {finalActions ? <div className="shrink-0">{finalActions}</div> : null}
    </div>
  )
}

export function PageSection({ children }: { children: ReactNode }) {
  return <div className="mt-6">{children}</div>
}
