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
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16 relative">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
            About Me
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto bg-gradient-to-r from-blue-200 via-[#64ffda]/90 to-blue-200 text-transparent bg-clip-text animate-gradient">
            Passionate developer crafting digital experiences that make a difference
          </p>
        </div>

        {/* Journey Section */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-20">
          <div className="glassmorphism-card p-6 md:p-8 rounded-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#64ffda]/5 via-blue-500/5 to-purple-500/5 animate-gradient-slow rounded-2xl"></div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
              My Journey
            </h2>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-transparent bg-clip-text animate-gradient">
                Hi! I&apos;m Mohammed Shareef, a passionate web and mobile app developer with over 5 years of experience creating digital solutions that help businesses grow and succeed.
              </p>

              <p className="text-lg leading-relaxed bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-transparent bg-clip-text animate-gradient">
                My journey started with curiosity about how websites work, which led me to dive deep into programming. Today, I specialize in creating modern, responsive web applications and cross-platform mobile apps using cutting-edge technologies.
              </p>

              <p className="text-lg leading-relaxed bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-transparent bg-clip-text animate-gradient">
                When I&apos;m not coding, I love exploring new technologies, contributing to open-source projects, and helping other developers in the community. I believe in writing clean, maintainable code and delivering solutions that exceed client expectations.
              </p>
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

        {/* Skills Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
            Skills & Technologies
          </h2>
          
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Professional Timeline</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-[#233554]"></div>
            
            {timeline.map((item: any, index: number) => (
              <div
                key={index}
                className={`relative flex items-center mb-12 ${
                  index % 2 === 0 ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pl-8' : 'pr-8'}`}>
                  <div className="bg-[#112240]/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-[#233554]">
                    <div className="flex items-center mb-2">
                      <span className={`w-3 h-3 rounded-full mr-3 ${
                        item.type === 'work' ? 'bg-[#64ffda]' : 'bg-purple-500'
                      }`}></span>
                      <span className="text-gray-400 text-sm">{item.year}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-[#64ffda] mb-3">{item.company}</p>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#0a192f] rounded-full border-2 border-[#64ffda]"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Areas of Interest</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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