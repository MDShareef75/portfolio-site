import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from './components/ClientLayout'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import BackToTopButton from './components/BackToTopButton'


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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://atomsinnovation.com/',
    title: "Atom's Innovation Hub | Mohammed Shareef",
    description: 'Full-stack developer specializing in modern web technologies, AI, and embedded systems',
    siteName: "Atom's Innovation Hub",
    images: [
      {
        url: '/images/IMG_0609.jpg',
        width: 1200,
        height: 630,
        alt: 'Mohammed Shareef - Full Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Atom's Innovation Hub | Mohammed Shareef",
    description: 'Full-stack developer specializing in modern web technologies, AI, and embedded systems',
    images: ['/images/IMG_0609.jpg'],
  },
  icons: {
    icon: '/favicon-v2.ico',
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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] relative overflow-x-hidden`}>
        {/* Enhanced animated background effects */}
        <div className="fixed inset-0 -z-10">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[#233554] opacity-90"></div>
          
          {/* Animated color orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-300"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow delay-700"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay animate-gradient-slow">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/40 via-blue-500/40 to-purple-500/40 animate-gradient"></div>
          </div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-[0.07] mix-blend-overlay"></div>
        </div>
        
        <ThemeProvider>
          <ClientLayout inter={inter}>
            {children}
            <BackToTopButton />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
