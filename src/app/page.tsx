'use client'

import Link from 'next/link'
import ProfileImage from './components/ProfileImage'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header Text */}
      <div className="absolute top-0 left-0 right-0 pt-16 md:pt-20 pb-0 px-2 md:px-4 text-center z-20">
        <div className="inline-block px-6 py-3 md:px-8 md:py-4 rounded-full bg-[#112240]/30 backdrop-blur-md border border-[#233554]/50 hover:bg-[#112240]/40 transition-all duration-300 mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient tracking-wide">
            Atom&apos;s Innovation Hub
          </h1>
        </div>
      </div>

      <section className="container mx-auto px-4 py-0 flex items-center justify-center min-h-[calc(100vh-4rem)] relative">
        <div className="text-center w-full max-w-3xl relative">
          {/* Additional colorful elements */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
          
          {/* Animated dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-0 w-2 h-2 bg-[#64ffda]/50 rounded-full animate-float"></div>
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-blue-500/50 rounded-full animate-float delay-300"></div>
            <div className="absolute bottom-1/4 left-1/4 w-2 h-2 bg-purple-500/50 rounded-full animate-float delay-700"></div>
            <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-[#64ffda]/50 rounded-full animate-float delay-1000"></div>
          </div>
          
          {/* Profile Image Container with enhanced glow */}
          <div className="relative py-6 md:py-8">
            <div className="absolute inset-[-10%] bg-gradient-to-r from-[#64ffda]/30 via-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="relative z-10">
              <ProfileImage />
            </div>
          </div>

          {/* Content Card with enhanced glassmorphism */}
          <div className="glassmorphism-card p-6 md:p-8 rounded-2xl transform hover:scale-[1.02] transition-all duration-500 relative overflow-hidden group">
            {/* Card background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#64ffda]/5 via-blue-500/5 to-purple-500/5 animate-gradient-slow"></div>
            <div className="absolute inset-0 bg-[url('/circuit-pattern.svg')] opacity-[0.03]"></div>
            
            {/* Card content */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 relative">
                <span className="bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
                  Mohammed Shareef
                </span>
                <div className="absolute -inset-x-6 -inset-y-2 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </h2>
              
              <h3 className="text-xl md:text-2xl lg:text-3xl mb-4 md:mb-6 animate-fade-in">
                <span className="bg-gradient-to-r from-blue-400 via-[#64ffda] to-blue-400 text-transparent bg-clip-text animate-gradient">
                  Web & Mobile App Developer
                </span>
              </h3>
              
              <p className="text-base md:text-lg mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto animate-fade-in delay-200">
                <span className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-transparent bg-clip-text animate-gradient">
                  I design clean, modern websites and mobile applications for businesses and individuals.
                  Bringing your vision to life with cutting-edge web and mobile technologies.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center animate-fade-in delay-300">
                <Link
                  href="/contact"
                  className="btn-primary group w-full sm:w-auto flex items-center justify-center text-sm md:text-base relative overflow-hidden"
                >
                  <span className="relative z-10 bg-gradient-to-r from-[#0a192f] to-[#112240] text-transparent bg-clip-text group-hover:from-[#112240] group-hover:to-[#0a192f] transition-all duration-300">
                    Contact Me
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/projects"
                  className="btn-secondary group w-full sm:w-auto flex items-center justify-center text-sm md:text-base"
                >
                  <span className="bg-gradient-to-r from-[#64ffda] via-blue-400 to-[#64ffda] text-transparent bg-clip-text animate-gradient">
                    View Projects
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 ml-2 transform group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced floating tech icons */}
          <div className="hidden md:block absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-0 animate-float delay-1000">
              <div className="text-4xl opacity-30 animate-glow">⚛️</div>
            </div>
            <div className="absolute top-1/3 right-0 animate-float delay-2000">
              <div className="text-4xl opacity-30 animate-glow">🚀</div>
            </div>
            <div className="absolute bottom-1/4 left-1/4 animate-float delay-3000">
              <div className="text-4xl opacity-30 animate-glow">💻</div>
            </div>
            <div className="absolute bottom-1/3 right-1/4 animate-float delay-4000">
              <div className="text-4xl opacity-30 animate-glow">🎨</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Clients Say
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take my word for it - here's what some of my amazing clients have to say
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#112240] p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <p className="text-gray-300 mb-4 italic">
              "Mohammed delivered an exceptional e-commerce solution that transformed our business operations. The app is intuitive, fast, and our customers love it!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                K
              </div>
              <div>
                <div className="text-white font-medium">Kalpavruksha Hardware</div>
                <div className="text-gray-400 text-sm">E-commerce Client</div>
              </div>
            </div>
          </div>

          <div className="bg-[#112240] p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <p className="text-gray-300 mb-4 italic">
              "Professional, reliable, and delivers high-quality work on time. Mohammed's attention to detail is impressive and the final product exceeded our expectations."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                S
              </div>
              <div>
                <div className="text-white font-medium">Sarah Johnson</div>
                <div className="text-gray-400 text-sm">Startup Founder</div>
              </div>
            </div>
          </div>

          <div className="bg-[#112240] p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <p className="text-gray-300 mb-4 italic">
              "The mobile app Mohammed developed for us has significantly improved our customer engagement. Great communication throughout the project!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                M
              </div>
              <div>
                <div className="text-white font-medium">Mike Chen</div>
                <div className="text-gray-400 text-sm">Restaurant Owner</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
