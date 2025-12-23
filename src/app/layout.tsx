import type { Metadata } from 'next'
import './globals.css'

import AuthGate from '@/components/auth/AuthGate'
import SidebarNav from '@/components/dashboard/layout/SidebarNav'
import BottomNav from '@/components/dashboard/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Vinted Flips',
  description: 'Panel para gestionar lotes y prendas (Vinted Flips)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-[var(--bg)] text-[var(--fg)] antialiased">
        <AuthGate>
          <div className="min-h-dvh bg-[var(--bg)]">
            <div className="mx-auto flex w-full max-w-6xl">
              <SidebarNav />

              <div className="flex-1">
                {/* Contenido */}
                <main className="vf-safe-bottom w-full px-4 py-4 md:px-8 md:py-8">{children}</main>
              </div>
            </div>

            {/* Navegación inferior (mobile) */}
            <BottomNav />
          </div>
        </AuthGate>
      </body>
    </html>
  )
}
