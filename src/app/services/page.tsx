'use client'

import { useState } from 'react'

const services = [
  {
    id: 1,
    title: 'Web Development',
    description: 'Building modern, responsive websites using cutting-edge technologies like React, Next.js, and TypeScript.',
    icon: '💻',
    features: [
      'Custom Web Applications',
      'Responsive Design',
      'Performance Optimization',
      'SEO Integration'
    ]
  },
  {
    id: 2,
    title: 'Mobile App Development',
    description: 'Creating cross-platform mobile applications with Flutter and React Native for seamless user experiences.',
    icon: '📱',
    features: [
      'Native Performance',
      'Cross-Platform Apps',
      'Push Notifications',
      'Offline Support'
    ]
  },
  {
    id: 3,
    title: 'Backend Development',
    description: 'Developing robust backend systems and APIs using Node.js, Python, and cloud technologies.',
    icon: '⚙️',
    features: [
      'API Development',
      'Database Design',
      'Cloud Integration',
      'Security Implementation'
    ]
  },
  {
    id: 4,
    title: 'UI/UX Design',
    description: 'Crafting beautiful and intuitive user interfaces with a focus on user experience and modern design principles.',
    icon: '🎨',
    features: [
      'User Research',
      'Wireframing',
      'Prototyping',
      'Design Systems'
    ]
  }
]

export default function Services() {
  const [hoveredService, setHoveredService] = useState<number | null>(null)

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
            My Services
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto bg-gradient-to-r from-blue-200 via-[#64ffda]/90 to-blue-200 text-transparent bg-clip-text animate-gradient">
            Comprehensive solutions for your digital needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.02]"
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#112240]/90 via-[#112240] to-[#0a192f] opacity-90"></div>
              
              {/* Card Content */}
              <div className="relative p-8 z-10">
                <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-[#64ffda] text-transparent bg-clip-text group-hover:animate-gradient">
                  {service.title}
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {service.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center text-gray-300 group-hover:text-[#64ffda] transition-colors duration-300"
                    >
                      <svg
                        className="w-5 h-5 mr-3 text-[#64ffda]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-500 rounded-lg font-medium transform hover:scale-105"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  )
} 