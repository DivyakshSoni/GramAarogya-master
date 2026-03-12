import "./globals.css"
import { Inter } from "next/font/google"
import type React from "react"
import type { Metadata, Viewport } from "next"
import MouseMoveEffect from "@/components/mouse-move-effect"
import ServiceWorkerRegistration from "@/components/sw-register"
import EmergencySOS from "@/components/emergency-sos"
import ChatBot from "@/components/chat-bot"
import { LangProvider } from "@/components/lang-context"
import "leaflet/dist/leaflet.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GramCare - Rural TeleHealth Access System",
  description: "AI-powered healthcare platform bridging the gap between rural communities and quality medical support.",
  generator: 'v0.dev',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GramCare",
  },
}

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <LangProvider>
          <ServiceWorkerRegistration />
          <ChatBot />
          <EmergencySOS />
          <MouseMoveEffect />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}