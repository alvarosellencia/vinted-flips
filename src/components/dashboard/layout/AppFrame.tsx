'use client'

import AuthGate from '@/components/auth/AuthGate'
import SidebarNav from '@/components/dashboard/layout/SidebarNav'
import BottomNav from '@/components/dashboard/layout/BottomNav'

export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-dvh bg-[var(--bg)]">
        <div className="mx-auto flex w-full max-w-6xl">
          <SidebarNav />

          <div className="flex-1">
            <main className="vf-safe-bottom w-full px-4 py-4 md:px-8 md:py-8">{children}</main>
          </div>
        </div>

        <BottomNav />
      </div>
    </AuthGate>
  )
}
