import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from './components/ClientLayout'
import { ThemeProvider } from './context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Atom's Innovation Hub",
  description: 'Full-stack developer specializing in modern web technologies, AI, and embedded systems',
  icons: {
    icon: '/images/Atom inteligence at core.png',
    apple: '/images/Atom inteligence at core.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0a192f] text-gray-100 relative overflow-x-hidden`}>
        {/* Enhanced animated background effects */}
        <div className="fixed inset-0 -z-10">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#233554] opacity-90"></div>
          
          {/* Animated color orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#64ffda]/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-[10%] right-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-300"></div>
          <div className="absolute bottom-[-20%] left-[10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow delay-700"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-[#64ffda]/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay animate-gradient-slow">
            <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/40 via-blue-500/40 to-purple-500/40 animate-gradient"></div>
          </div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-[0.07] mix-blend-overlay"></div>
        </div>
        
        <ThemeProvider>
          <ClientLayout inter={inter}>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
