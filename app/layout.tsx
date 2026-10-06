import type { Metadata } from "next";
import "./globals.css";
import "./armoniq.css";

export const metadata: Metadata = {
  title: "Armoniq · Música para tu historia",
  description: "Aprende música a tu ritmo.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}

