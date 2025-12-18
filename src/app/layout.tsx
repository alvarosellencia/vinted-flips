import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vinted Flips",
  description: "Panel para resellers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="vf-body">{children}</body>
    </html>
  );
}