'use client'

import type { ReactNode } from 'react'

import SidebarNav from '@/components/dashboard/layout/SidebarNav'
import BottomNav from '@/components/dashboard/layout/BottomNav'

export default function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-clip bg-white">
      <div className="mx-auto flex w-full max-w-[1100px] min-w-0">
        {/* Sidebar (desktop) */}
        <SidebarNav />

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* IMPORTANT: w-full (no w-screen), min-w-0, overflow-x-clip */}
          <main className="w-full min-w-0 flex-1 overflow-x-clip px-4 py-6 md:px-6 md:py-8 pb-24">
            {/* inner width container */}
            <div className="w-full min-w-0 max-w-full">{children}</div>
          </main>

          {/* Bottom nav (mobile) */}
          <BottomNav />
        </div>
      </div>
    </div>
  )
}