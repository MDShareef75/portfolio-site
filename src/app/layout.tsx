import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from './components/ClientLayout'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import BackToTopButton from './components/BackToTopButton'
import ErrorBoundary from './components/ErrorBoundary'



const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://atomsinnovation.com'),
  title: "Atom's Innovation Hub | Mohammed Shareef",
  description: 'Mohammed Shareef - Full-stack developer specializing in modern web technologies, AI, and embedded systems. Building digital experiences for the future.',
  keywords: 'web development, mobile development, React, Next.js, Flutter, full-stack developer, AI, embedded systems',
  authors: [{ name: 'Mohammed Shareef' }],
  creator: 'Mohammed Shareef',
  publisher: "Atom's Innovation Hub",
  robots: 'index, follow',
  verification: {
    google: 'k1OIAG63mVye_lJcawPxCP5oL-US6TcdkqLo2qm-6vM',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://atomsinnovation.com/',
    title: "Atom's Innovation Hub | Mohammed Shareef",
    description: 'Full-stack developer specializing in modern web technologies, AI, and embedded systems',
    siteName: "Atom's Innovation Hub",
    images: [
      {
        url: '/images/atoms-innovation.png',
        width: 1200,
        height: 630,
        alt: 'Atom Innovation Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Atom's Innovation Hub | Mohammed Shareef",
  description: 'Full-stack developer specializing in modern web technologies, AI, and embedded systems',
    images: ['/images/atoms-innovation.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon-v2.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: '/favicon-v2.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a192f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <html lang="en" className="scroll-smooth" suppressHydrationWarning>

        <body className={`${inter.className} min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] relative overflow-x-hidden`} suppressHydrationWarning>
        {/* Simple background */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] to-[var(--surface)]"></div>
        </div>
        
        <ErrorBoundary>
          <ThemeProvider>
            <ClientLayout inter={inter}>
              {children}
              <BackToTopButton />
            </ClientLayout>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
