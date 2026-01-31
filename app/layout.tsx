import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  Noto_Sans_JP,
  Source_Sans_3,
  Space_Grotesk
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  weight: ["400", "500", "600"],
  display: "swap"
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-jp",
  weight: ["400", "600"],
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap"
});

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
    <html
      lang="de"
      className={`${spaceGrotesk.variable} ${sourceSans.variable} ${notoSansJP.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
