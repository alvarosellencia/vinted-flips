import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinted Flips",
  description: "Panel de métricas para resellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={[
          "min-h-screen",
          "vf-body",
          // espacio para bottom nav + safe area iOS
          "pb-[calc(env(safe-area-inset-bottom)+92px)]",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}