import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Mzansi Word — SA's daily word game",
  description:
    "A free daily word game in South Africa's languages. Solve today's word in isiXhosa or English and you're in the draw for airtime prizes.",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
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
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <Header />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-3 pt-4">
          {children}
        </main>
        <footer className="mx-auto flex w-full max-w-md items-center justify-center gap-3 px-3 py-3 text-xs text-zinc-400">
          <a href="/rules" className="underline">
            Competition rules
          </a>
          <a href="/privacy" className="underline">
            Privacy
          </a>
          <a href="/winners" className="underline">
            Winners
          </a>
          <a href="/me" className="underline">
            My profile
          </a>
        </footer>
      </body>
    </html>
  );
}
