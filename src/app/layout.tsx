import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Fredoka } from "next/font/google";
import "./globals.css";
import { FxLayer } from "@/components/FxLayer";
import { Header } from "@/components/Header";
import { SwRegister } from "@/components/SwRegister";

// Fredoka: the "game pieces" voice (tiles, wheel letters).
// Bricolage Grotesque: the display voice (wordmark, headings, buttons).
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mzansi Word — SA's daily word game",
  description:
    "A free daily word game in South Africa's languages. Solve today's word in isiXhosa or English and you're in the draw for airtime prizes.",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  openGraph: {
    siteName: "Mzansi Word",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#120f17",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fredoka.variable} ${bricolage.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SwRegister />
        <FxLayer />
        <Header />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-3 pt-3">
          {children}
        </main>
        <div className="hairline-trim mx-auto w-full max-w-md opacity-60" />
        <footer className="mx-auto flex w-full max-w-md items-center justify-center gap-4 px-3 py-3 text-xs text-muted">
          <a href="/rules" className="transition-colors hover:text-foreground">
            Rules
          </a>
          <a href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="/winners" className="transition-colors hover:text-foreground">
            Winners
          </a>
          <a href="/me" className="transition-colors hover:text-foreground">
            My profile
          </a>
        </footer>
      </body>
    </html>
  );
}
