import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-thai",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Intake System · ลงทะเบียนผู้ป่วยเรียลไทม์",
  description: "Real-time patient intake with a live staff dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${plexThai.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <LocaleProvider>
          <Header />
          <main className="min-h-[calc(100dvh-56px)]">{children}</main>
        </LocaleProvider>
      </body>
    </html>
  );
}
