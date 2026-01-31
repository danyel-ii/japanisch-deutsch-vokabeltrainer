import type { Metadata } from "next";
import {
  Anton,
  DM_Serif_Text,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Noto_Sans_JP,
  Source_Sans_3,
  Space_Grotesk
} from "next/font/google";
import ThemeToggle from "./components/theme-toggle";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500", "600", "700"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"]
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400"
});

const dmSerif = DM_Serif_Text({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: ["400"]
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"]
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  weight: ["400", "500", "600"]
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-jp",
  weight: ["400", "600"]
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
      data-theme="main"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} ${anton.variable} ${dmSerif.variable} ${spaceGrotesk.variable} ${sourceSans.variable} ${notoSansJP.variable}`}
    >
      <body className="min-h-screen">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
