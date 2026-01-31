import type { Metadata } from "next";
import ThemeToggle from "./components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vokabel-Arbeitsblatt",
  description: "Vokabeln im Arbeitsblatt-Stil ueben und drucken."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" data-theme="main" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Serif+Text:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
