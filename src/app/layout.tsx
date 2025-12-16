import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinted Flips",
  description: "Panel de control para lotes y prendas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={[
          "min-h-screen",
          // Deja espacio para la bottom nav fija + safe area iOS
          "pb-[calc(env(safe-area-inset-bottom)+92px)]",
          "px-3 sm:px-6",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}