// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinted Flips",
  description: "Panel de lotes y prendas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#070b16] text-slate-100">{children}</body>
    </html>
  );
}
