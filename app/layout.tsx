import type { Metadata, Viewport } from 'next'
import { Noto_Sans_Thai } from 'next/font/google'

import './globals.css'

const notoSansThai = Noto_Sans_Thai({ subsets: ['thai', 'latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Bus Tracker - Electric Bus Tracking System',
  description: 'Real-time electric bus tracking system for university campus',
}

export const viewport: Viewport = {
  themeColor: '#e63462',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`${notoSansThai.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
