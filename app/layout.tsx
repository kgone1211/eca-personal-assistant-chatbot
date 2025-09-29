import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './trainer/trainer.css'
import './dashboard/dashboard.css'
import Navigation from './components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ECA Personal Assistant',
  description: 'AI-powered coaching assistant trained in your voice using Elite Coaching Academy methodology',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}