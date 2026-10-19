import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '../components/Toast'

export const metadata: Metadata = {
  title: 'CivicScan — AI Civic Issue Reporter | Patiala',
  description: 'Report civic issues in seconds using AI. Automatic detection, routing, and resolution for Indian municipalities.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#f8f9fc] text-[#1a1a2e] min-h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
