import type { Metadata } from 'next'
import './globals.css'

import AppFrame from '@/components/dashboard/layout/AppFrame'

export const metadata: Metadata = {
  title: 'Vinted Flips',
  description: 'Panel para gestionar lotes y prendas (Vinted Flips)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--fg)] antialiased">
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  )
}
