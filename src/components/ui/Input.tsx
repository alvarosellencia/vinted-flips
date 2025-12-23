'use client'

import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'h-11 w-full rounded-2xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--fg)]',
        'placeholder:text-[var(--muted)]',
        'shadow-[var(--shadow-xs)]',
        'focus:outline-none focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)]',
        className
      ].join(' ')}
    />
  )
}
