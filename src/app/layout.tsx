// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Vinted Flips",
  description: "Panel de lotes y prendas",
};

// IMPORTANT: iOS safe-area (notch / home indicator)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}