import type React from "react"
import type { Metadata } from "next"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { Providers } from "./providers"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { LayoutContent } from "@/components/layout/layout-content"

const geistSans = GeistSans
const geistMono = GeistMono

export const metadata: Metadata = {
  title: "Business Dashboard",
  description: "Modern business management dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
      <body className="font-sans">
        <ErrorBoundary>
          <Providers>
            <LayoutContent>{children}</LayoutContent>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
