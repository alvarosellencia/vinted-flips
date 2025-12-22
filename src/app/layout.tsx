import './globals.css'
import AuthGate from '../components/auth/AuthGate'
import SidebarNav from '../components/dashboard/layout/SidebarNav'
import BottomNav from '../components/dashboard/layout/BottomNav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="bg-white text-gray-900 antialiased">
        <AuthGate>
          <div className="min-h-screen md:flex">
            <SidebarNav />
            <main className="flex-1">
              <div className="mx-auto max-w-5xl px-4 pb-24 md:pb-10">
                {children}
              </div>
            </main>
          </div>

          {/* Mobile only */}
          <div className="md:hidden">
            <BottomNav />
          </div>
        </AuthGate>
      </body>
    </html>
  )
}
