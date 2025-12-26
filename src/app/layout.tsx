import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import AppFrame from '@/components/dashboard/layout/AppFrame'

export const metadata: Metadata = {
  title: 'Vinted Flips',
  description: 'Panel para gestionar lotes y prendas, KPIs y export CSV.',
}

const overflowFixCss = `
html, body { overflow-x: hidden; }

/* Prevent horizontal “jump” when the vertical scrollbar appears after data loads */
html {
  scrollbar-gutter: stable;
}

/* Fallback for environments that don’t support scrollbar-gutter */
@media (min-width: 768px) {
  body {
    overflow-y: scroll;
  }
}

/* Avoid long text/values forcing horizontal scroll */
.vf-card, .vf-panel, .vf-card-inner { max-width: 100%; }

.vf-row, .vf-row-kpis, .vf-row-actions { min-width: 0; }

.vf-row-title, .vf-row-meta, .vf-kpi-value, .vf-kpi-label {
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Core responsive layout for each row/card */
.vf-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}

/* KPI block should never overflow on mobile */
.vf-row-kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
}

.vf-row-actions {
  display: flex;
  justify-content: flex-end;
}

@media (min-width: 640px) {
  .vf-row {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .vf-row-kpis {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px 18px;
  }
}

@media (min-width: 1024px) {
  .vf-row {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }
}
`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">
        <AppFrame>{children}</AppFrame>
        <style>{overflowFixCss}</style>
      </body>
    </html>
  )
}
