'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'

const VISITOR_COUNT_URL = 'https://us-central1-atoms-portfolio.cloudfunctions.net/visitorCount';
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ClientLayout({
  children,
  inter,
}: {
  children: React.ReactNode
  inter: any
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  // Visitor count logic
  const { data: visitorData, error: visitorError, isLoading: visitorLoading } = useSWR(VISITOR_COUNT_URL, fetcher, { revalidateOnFocus: false })

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/circuit-pattern.svg')] opacity-5"></div>
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/20 dark:bg-[#64ffda]/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-blue-500/20 dark:bg-[#64ffda]/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-[#64ffda]/10 rounded-full blur-3xl animate-pulse-slow delay-2000"></div>
      </div>

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="bg-[#0a192f]/80 backdrop-blur-xl border-b border-[#233554]/50">
          <div className="container mx-auto px-4 py-2 md:py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="block w-12 h-12 md:w-16 md:h-16 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/20 to-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <Image
                  src="/images/Atom inteligence at core.png"
                  alt="Atom Intelligence Logo"
                  fill
                  className="object-cover rounded-[30%] group-hover:scale-105 transition-transform duration-500 relative z-10"
                  sizes="(max-width: 768px) 48px, 64px"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/about', label: 'About' },
                  { href: '/projects', label: 'Projects' },
                  { href: '/services', label: 'Services' },
                  { href: '/blog', label: 'Blog' },
                  { href: '/contact', label: 'Contact' },
                ].map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative px-2 py-1 text-gray-300 transition-all duration-500 text-sm lg:text-base ${
                        active ? 'text-[#64ffda] font-semibold' : 'hover:text-[#64ffda] hover:translate-y-[-2px]'
                      }`}
                    >
                      {item.label}
                      <span
                        className={`block absolute left-0 right-0 -bottom-1 h-[2px] bg-gradient-to-r from-[#64ffda] to-blue-400 rounded-full transition-all duration-300
                          ${active ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}
                        `}
                        style={{ transformOrigin: 'left' }}
                      />
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button 
                  className="text-gray-300 hover:text-[#64ffda] transition-all duration-500 p-2 hover:bg-[#233554]/30 rounded-lg"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden mt-2 pb-4 border-t border-[#233554]/50 animate-fade-in">
                <div className="flex flex-col space-y-2 pt-4">
                  <Link 
                    href="/" 
                    className={`text-gray-300 transition-all duration-500 py-3 px-4 rounded-lg text-sm ${
                      isActive('/') 
                        ? 'bg-[#64ffda]/10 text-[#64ffda] border-l-2 border-[#64ffda] translate-x-2' 
                        : 'hover:bg-[#233554]/30 hover:text-[#64ffda] hover:translate-x-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/about" 
                    className={`text-gray-300 transition-all duration-500 py-3 px-4 rounded-lg text-sm ${
                      isActive('/about') 
                        ? 'bg-[#64ffda]/10 text-[#64ffda] border-l-2 border-[#64ffda] translate-x-2' 
                        : 'hover:bg-[#233554]/30 hover:text-[#64ffda] hover:translate-x-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link 
                    href="/projects" 
                    className={`text-gray-300 transition-all duration-500 py-3 px-4 rounded-lg text-sm ${
                      isActive('/projects') 
                        ? 'bg-[#64ffda]/10 text-[#64ffda] border-l-2 border-[#64ffda] translate-x-2' 
                        : 'hover:bg-[#233554]/30 hover:text-[#64ffda] hover:translate-x-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Projects
                  </Link>
                  <Link 
                    href="/services" 
                    className={`text-gray-300 transition-all duration-500 py-3 px-4 rounded-lg text-sm ${
                      isActive('/services') 
                        ? 'bg-[#64ffda]/10 text-[#64ffda] border-l-2 border-[#64ffda] translate-x-2' 
                        : 'hover:bg-[#233554]/30 hover:text-[#64ffda] hover:translate-x-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Services
                  </Link>
                  <Link 
                    href="/blog" 
                    className={`text-gray-300 transition-all duration-500 py-3 px-4 rounded-lg text-sm ${
                      isActive('/blog') 
                        ? 'bg-[#64ffda]/10 text-[#64ffda] border-l-2 border-[#64ffda] translate-x-2' 
                        : 'hover:bg-[#233554]/30 hover:text-[#64ffda] hover:translate-x-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Blog
                  </Link>
                  <Link 
                    href="/contact" 
                    className={`text-gray-300 transition-all duration-500 py-3 px-4 rounded-lg text-sm ${
                      isActive('/contact') 
                        ? 'bg-[#64ffda]/10 text-[#64ffda] border-l-2 border-[#64ffda] translate-x-2' 
                        : 'hover:bg-[#233554]/30 hover:text-[#64ffda] hover:translate-x-2'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20 md:pt-28 relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#233554]/50">
        <div className="glassmorphism py-6 md:py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center space-x-6 mb-4">
              <a 
                href="http://linkedin.com/in/mohammed-shareef75/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#64ffda] transition-all duration-500 hover:scale-110 transform"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/MDShareef75"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#64ffda] transition-all duration-500 hover:scale-110 transform"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
              </a>
            </div>
            <p className="text-center text-gray-400 text-sm md:text-base">
              © {new Date().getFullYear()} Mohammed Shareef. All rights reserved.
            </p>
            <div className="text-center mt-2 text-xs text-[#64ffda]">
              {visitorLoading ? 'Loading visitors...' : visitorError ? 'Could not load visitor count.' : `👁️ ${visitorData?.count ?? 0} visitors`}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 