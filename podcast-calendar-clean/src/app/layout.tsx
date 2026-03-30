import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WLGC — Schedule',
  description: 'What Left the Group Chat — Podcast Scheduling',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
