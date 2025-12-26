import React from 'react'

export default function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'bg-white border border-gray-200 rounded-2xl p-4 shadow-sm',
        'w-full max-w-full min-w-0 overflow-x-clip',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}