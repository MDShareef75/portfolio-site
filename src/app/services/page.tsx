'use client'

import { useState } from 'react'
import PriceCalculator from '../components/PriceCalculator'

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
    ],
    pricing: [
      { tier: 'Basic Portfolio / Informational', range: '₹2,500 – ₹12,500' },
      { tier: 'Small Business Website', range: '₹12,500 – ₹50,000' },
      { tier: 'Custom Web App (React/Next.js)', range: '₹50,000 – ₹1,50,000+' },
      { tier: 'E-commerce Website (WooCommerce)', range: '₹37,500 – ₹1,00,000' },
      { tier: 'Enterprise Web Platform', range: '₹75,000 – ₹3,75,000+' }
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
    ],
    pricing: [
      { tier: 'Simple App (MVP)', range: '₹50,000 – ₹1,25,000' },
      { tier: 'Medium Complexity App', range: '₹1,25,000 – ₹3,12,500' },
      { tier: 'Complex App', range: '₹3,12,500 – ₹9,37,500+' },
      { tier: 'Cross-platform (Flutter)', range: '20–30% cheaper than native' }
    ]
  },
  {
    id: 3,
    title: 'E-commerce Solutions',
    description: 'Developing robust backend systems and APIs using Node.js, Python, and cloud technologies.',
    icon: '🛒',
    features: [
      'API Development',
      'Database Design',
      'Cloud Integration',
      'Security Implementation'
    ],
    pricing: [
      { tier: 'Shopify Basic Setup', range: '₹7,500 – ₹25,000' },
      { tier: 'WooCommerce Site', range: '₹25,000 – ₹75,000' },
      { tier: 'Custom E-commerce App', range: '₹75,000 – ₹2,50,000+' },
      { tier: 'Enterprise E-commerce', range: '₹2,50,000 – ₹12,50,000+' }
    ]
  },
  {
    id: 4,
    title: 'Freelance Packages',
    description: 'Crafting beautiful and intuitive user interfaces with a focus on user experience and modern design principles.',
    icon: '🤝',
    features: [
      'User Research',
      'Wireframing',
      'Prototyping',
      'Design Systems'
    ],
    pricing: [
      { tier: 'Starter', range: '₹3,750 – ₹7,500 (Static site or basic app)' },
      { tier: 'Growth', range: '₹12,500 – ₹37,500 (Dynamic site or MVP app)' },
      { tier: 'Premium', range: '₹50,000+ (Full-stack app with backend, analytics, integrations)' }
    ]
  }
]

export default function Services() {
  const [hoveredService, setHoveredService] = useState<number | null>(null)

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16">
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

                {/* Pricing Section */}
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-center text-[#64ffda] mb-6">Pricing Tiers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                    {service.pricing.map((priceTier, index) => (
                      <div key={index} className="bg-[#0a192f]/50 p-4 rounded-lg border border-[#233554] transform transition-transform duration-300 hover:scale-105 hover:border-[#64ffda]/50">
                        <p className="font-semibold text-gray-300">{priceTier.tier}</p>
                        <p className="text-lg font-bold text-[#64ffda] mt-2">{priceTier.range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Why Work With Me Section */}
        <div className="max-w-4xl mx-auto mt-24 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">Why Work With Me?</h2>
          <ul className="space-y-4 text-lg text-gray-300 list-disc list-inside">
            <li>5+ years of hands-on experience in web and mobile app development</li>
            <li>Client-focused approach with a strong emphasis on communication</li>
            <li>Proven track record of delivering projects on time and within budget</li>
            <li>Expertise in modern technologies and best practices</li>
            <li>Commitment to clean, maintainable, and scalable code</li>
            <li>Continuous learning and adaptation to new trends</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-[#64ffda] mb-2">How do you determine project pricing?</h3>
              <p className="text-gray-300">Pricing is based on project complexity, features, and timeline. After an initial consultation, I provide a detailed quote tailored to your needs.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#64ffda] mb-2">What is your typical project timeline?</h3>
              <p className="text-gray-300">Most projects take 2–8 weeks depending on requirements. I always set clear milestones and keep you updated throughout the process.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#64ffda] mb-2">Do you offer post-launch support?</h3>
              <p className="text-gray-300">Yes! I offer maintenance, updates, and support packages to ensure your product stays up-to-date and bug-free.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#64ffda] mb-2">Can you work with my existing team?</h3>
              <p className="text-gray-300">Absolutely. I can collaborate with your in-house developers, designers, or other freelancers to deliver the best results.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#64ffda] mb-2">How do we get started?</h3>
              <p className="text-gray-300">Just reach out via the contact form or WhatsApp. We'll schedule a call to discuss your project and next steps.</p>
            </div>
          </div>
        </div>

        {/* Price Calculator Section */}
        <PriceCalculator />

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