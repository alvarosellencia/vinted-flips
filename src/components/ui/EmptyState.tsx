import type { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="w-full rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center">
      <div className="mx-auto max-w-md">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        {description ? <div className="mt-2 text-sm text-gray-600">{description}</div> : null}
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  )
}
