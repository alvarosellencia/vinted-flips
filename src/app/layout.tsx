import './globals.css'
import AuthGate from '@/components/auth/AuthGate'
import BottomNav from '@/components/layout/BottomNav'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">
        <AuthGate>
          <main className="max-w-md mx-auto pb-24">{children}</main>
          <BottomNav />
        </AuthGate>
      </body>
    </html>
  )
}
