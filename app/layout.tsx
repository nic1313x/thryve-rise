import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/contexts/toast'

export const metadata: Metadata = {
  title: 'Thryve Rise',
  description: 'Gamified leadership transition tracker — Thryve Accounting & Advisory Services',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌱</text></svg>',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
