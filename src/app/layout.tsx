import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppFrame } from '@/components/dashboard/layout/AppFrame';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vinted Flips Manager',
  description: 'Gestión de inventario y ventas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AppFrame>
          {children}
        </AppFrame>
      </body>
    </html>
  );
}