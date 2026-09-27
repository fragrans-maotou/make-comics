import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import {
  Inter,
  Bangers,
  Space_Grotesk,
  Instrument_Serif,
} from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import PlausibleProvider from "next-plausible"
import { ClerkProvider } from "@clerk/nextjs"
import { clerkEnabled } from "@/lib/runtime-config"
import "./globals.css"

const noto = localFont({
  src: "../assets/fonts/NotoSansSC-Regular.woff",
  variable: "--font-noto",
  display: "swap",
  weight: "400",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})
const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
})

export const metadata: Metadata = {
  title: "西游四格",
  description: "把西游记取经路上的事，写成现代人视角的 4 到 6 格短漫。先改剧本，再逐格出图，中文对白由程序画进气泡。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const tree = (
    <html
      lang="zh-CN"
      className={`${noto.variable} ${inter.variable} ${bangers.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <PlausibleProvider
          src="https://plausible.io/js/script.js"
          scriptProps={{ "data-domain": "makecomics.io" }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  )

  if (!clerkEnabled()) return tree
  return <ClerkProvider>{tree}</ClerkProvider>
}
