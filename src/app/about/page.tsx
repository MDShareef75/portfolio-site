'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import useSWR from 'swr'

const categories = ['All', 'Frontend', 'Backend', 'Mobile', 'DevOps', 'Tools']

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function About() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [mounted, setMounted] = useState(false)
  const categories = ['All', 'Backend', 'Frontend', 'Database', 'Tools', 'AI', 'Embedded', 'Language']

  const { data, error, isLoading } = useSWR('/api/about', fetcher, { revalidateOnFocus: false })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return <div className="text-center py-20 text-xl text-[#64ffda]">Loading...</div>
  }
  if (error) {
    return <div className="text-center py-20 text-xl text-red-400">Failed to load about data.</div>
  }

  const skills = data.skills
  const timeline = data.timeline
  const interests = data.interests
  const funFacts = data.funFacts

  const filteredSkills = activeCategory === 'All' 
    ? skills 
    : skills.filter((skill: any) => skill.category === activeCategory)

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#101a2f] to-[#1a223f]">
      {/* Futuristic background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-[32vw] h-[32vw] bg-secondary/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16 relative animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent via-secondary to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_24px_rgba(100,255,218,0.25)]">About Us</h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mt-2">Learn more about our mission, values, and the passionate team driving Atoms Innovation forward.</p>
        </div>

        {/* Journey Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-20 animate-fade-in delay-100">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-br from-accent/30 via-secondary/20 to-purple-500/10 rounded-2xl blur-2xl opacity-80 pointer-events-none z-0 animate-pulse-slow"></div>
            <div className="relative bg-[#101a2f]/80 backdrop-blur-lg border border-accent/30 shadow-2xl p-8 md:p-10 rounded-2xl z-10 overflow-hidden">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-accent">Who we are</h2>
              <div className="space-y-4 text-gray-200 text-base leading-relaxed text-left md:text-justify">
                <p>Atoms Innovation is a passionate, forward-thinking development studio led by Mohammed Shareef. We specialize in building scalable, elegant digital solutions for businesses, creators, and startups across the globe.</p>
                <p>Our team thrives on innovation, clean code, and pixel-perfect design. We believe in rapid delivery without sacrificing quality, and we're always exploring the latest technologies to keep our clients ahead of the curve.</p>
                <p>We value transparency, collaboration, and long-term partnerships. Our approach is client-centric: we listen, adapt, and deliver solutions tailored to your unique needs and vision.</p>
                <p>From web and mobile apps to cloud platforms and AI-driven tools, we've empowered clients in e-commerce, education, healthcare, and creative industries. Our mission is to make technology accessible, impactful, and beautiful for everyone we work with.</p>
                <p className="text-accent font-semibold">Let's build the future—together.</p>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-[-10%] bg-gradient-to-r from-[#64ffda]/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse-slow"></div>
            <div className="relative h-96 rounded-2xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500">
              <Image
                src="/images/IMG_0609.jpg"
                alt="Mohammed Shareef"
                width={800}
                height={600}
                className="w-full h-full object-cover rounded-2xl"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="text-center mb-12 animate-fade-in delay-200">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent via-secondary to-accent text-transparent bg-clip-text animate-gradient">Our Toolkit</h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-[#64ffda] text-[#0a192f] font-semibold shadow-lg shadow-[#64ffda]/20'
                    : 'bg-[#112240]/50 text-gray-300 hover:bg-[#112240] hover:text-[#64ffda]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
            {skills
              .filter((skill: any) => activeCategory === 'All' || skill.category === activeCategory)
              .map((skill: any, index: number) => (
                <div
                  key={skill.name}
                  className="glassmorphism-card p-4 rounded-xl group hover:border-[#64ffda]/30 transition-all duration-500"
                >
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    {skill.icon}
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-[#64ffda] via-blue-400 to-[#64ffda] text-transparent bg-clip-text animate-gradient">
                    {skill.name}
                  </h3>
                  <p className="text-sm text-gray-400">{skill.level}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-20 animate-fade-in delay-300">
          <h2 className="text-3xl font-bold text-center text-accent mb-12">Founder's Journey</h2>
          <div className="relative">
            {/* Timeline line for desktop */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-[#233554] hidden md:block"></div>
            {/* Timeline line for mobile */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-[#233554] md:hidden"></div>
            {timeline.map((item: any, index: number) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center mb-12 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Dot for mobile */}
                <div className="absolute left-2 top-8 w-3 h-3 bg-[#0a192f] rounded-full border-2 border-[#64ffda] md:hidden"></div>
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8'} mb-6 md:mb-0`}>
                  <div className="bg-[#112240]/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-[#233554]">
                    <div className="flex items-center mb-2">
                      <span className={`w-3 h-3 rounded-full mr-3 ${
                        item.type === 'work' ? 'bg-[#64ffda]' : 'bg-purple-500'
                      } md:hidden`}></span>
                      <span className="text-gray-400 text-sm">{item.year}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-[#64ffda] mb-3">{item.company}</p>
                    <p className="text-gray-300 text-sm text-justify">{item.description}</p>
                  </div>
                </div>
                {/* Dot for desktop */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#0a192f] rounded-full border-2 border-[#64ffda]"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="max-w-4xl mx-auto animate-fade-in delay-400">
          <h2 className="text-3xl font-bold text-center text-accent mb-8">What Drives Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-8">
            {interests.map((interest: any, index: number) => (
              <div
                key={index}
                className="bg-[#112240]/80 backdrop-blur-md p-6 rounded-xl text-center shadow-lg border border-[#233554] hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl mb-3">{interest.icon}</div>
                <p className="text-gray-300">{interest.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 