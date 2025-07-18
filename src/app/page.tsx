'use client'

import Link from 'next/link'
import ProfileImage from './components/ProfileImage'
import Carousel from './components/Carousel'
import { useTheme } from './context/ThemeContext'

export default function Home() {
  const { theme } = useTheme();
  return (
    <div 
      className="overflow-x-hidden overflow-y-auto flex flex-col relative pb-8 md:pb-12 xl:pb-20"
      style={{
        background: theme === 'light' 
          ? 'linear-gradient(45deg, #dbeafe 0%, #dcfce7 25%, #fae8ff 50%, #d1fae5 75%, #bfdbfe 100%)'
          : 'linear-gradient(to bottom, var(--background), var(--surface), var(--background))',
        minHeight: '100vh',
        width: '100vw'
      }}
    >
            {/* Simple background overlay */}
      {theme === 'light' && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-gradient-to-br from-blue-400/10 via-cyan-300/5 to-transparent rounded-full blur-2xl opacity-50"></div>
        </div>
      )}
      
      {/* Dark theme background glow */}
      {theme === 'dark' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-gradient-to-br from-accent/20 via-secondary/10 to-transparent rounded-full blur-xl opacity-60 pointer-events-none z-0"></div>
      )}


      
      <div className="w-full flex flex-col items-center justify-center mt-16 md:mt-12 lg:mt-20 mb-2 md:mb-4 px-4 relative z-20">
        <h1 className="relative z-30 text-4xl md:text-5xl xl:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-700 text-transparent bg-clip-text tracking-tight text-center mt-2 md:mt-4 xl:mt-0">
          Atom's Innovation
        </h1>
        <p className={`relative z-30 mt-2 md:mt-4 mb-4 md:mb-8 xl:mb-12 text-sm md:text-lg xl:text-2xl font-medium text-center ${theme === 'light' ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>
          Building Digital Experiences for the Future
        </p>
      </div>

      {/* Carousel and CTA side by side */}
      <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-6 md:gap-8 xl:gap-12 my-2 md:my-2 xl:my-4 mb-6 md:mb-10 xl:mb-16 relative z-10 max-w-screen-xl mx-auto px-2">
        <div className="w-full xl:w-3/4 2xl:w-2/3 max-w-4xl flex items-center justify-center">
          <Carousel />
        </div>
        <div className="w-full max-w-md flex flex-col items-center justify-center animate-fade-in delay-100">
          <h2 className={`text-xl md:text-2xl font-medium mb-6 text-center transition-colors duration-500 ${theme === 'light' ? 'text-[#2260a9]' : 'text-secondary'}`}>
            We craft fast, modern websites and mobile apps that bring your ideas to life.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/contact"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-accent to-secondary text-[#0f172a] font-semibold shadow-lg hover:from-secondary hover:to-accent transition-all text-lg"
            >
              Let's Talk
            </a>
            <a
              href="/projects"
              className="px-8 py-3 rounded-full border-2 border-accent text-accent font-semibold bg-surface/80 hover:bg-surface/90 transition-all text-lg"
            >
              View Our Work
            </a>
          </div>
          {/* Share Button */}
          <button
            onClick={() => {
              if (typeof window === 'undefined') return;
              
              if (navigator.share) {
                navigator.share({
                  title: "Atom's Innovation",
                  text: "We build stunning websites, mobile apps, and digital solutions for your business. Check us out!",
                  url: window.location.origin
                });
              } else {
                navigator.clipboard.writeText(
                  "We build stunning websites, mobile apps, and digital solutions for your business. Check us out! " + window.location.origin
                ).then(() => {
                  alert('Link copied to clipboard!');
                }).catch(() => {
                  alert('Failed to copy link. Please copy manually: ' + window.location.origin);
                });
              }
            }}
            className="mt-6 px-8 py-3 rounded-full bg-gradient-to-r from-blue-400 to-[#64ffda] text-[#0a192f] font-semibold shadow-lg hover:from-[#64ffda] hover:to-blue-400 transition-all text-lg flex items-center gap-2"
            aria-label="Share this website"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4m0 0L8 6m4-4v16" />
            </svg>
            Share
          </button>
        </div>
      </div>

      <section className="w-full px-0 py-0 flex flex-col items-center justify-center relative">
        <div className="text-center w-full max-w-3xl relative">
          {/* Simplified background elements for better mobile performance */}
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-xl opacity-50 pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-xl opacity-50 pointer-events-none"></div>

          {/* Profile Image Container with enhanced glow */}
          {/* Removed as per new design */}

          {/* Content Card with enhanced glassmorphism */}
          {/* Removed card for modern, open layout */}
          {/* Removed personal content block as requested */}

          {/* Enhanced floating tech icons */}
          {/* Removed floating tech icon stickers as requested */}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 flex flex-col items-center justify-center relative">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_24px_rgba(100,255,218,0.25)]`}>
            What Clients Say
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take my word for it - here's what some of my amazing clients have to say
          </p>
        </div>
        <div className="flex justify-center items-center w-full">
          <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.03] shadow-2xl border border-accent/20 bg-[var(--surface)]/80 backdrop-blur-lg max-w-md w-full mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface)]/90 via-[var(--surface)] to-[var(--background)] opacity-90"></div>
            <div className="relative z-10 p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {'★'.repeat(5)}
                </div>
              </div>
              <p className="text-[var(--text-secondary)] mb-4 italic">
                "Mohammed delivered an exceptional e-commerce solution that transformed our business operations. The app is intuitive, fast, and our customers love it!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-[var(--text)] font-bold mr-3">
                  K
                </div>
                <div>
                  <div className="text-[var(--text)] font-medium">Kalpavruksha Hardware</div>
                  <div className="text-[var(--text-secondary)] text-sm">E-commerce Client</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </section>
    </div>
  )
}
