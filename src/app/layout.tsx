import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vinted Flips",
  description: "Panel para resellers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={[
          "min-h-screen",
          // espacio para bottom nav fija + safe area iOS
          "pb-[calc(env(safe-area-inset-bottom)+92px)]",
          "px-3 sm:px-6",
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}