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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#101a2f] to-[#1a223f]">
      {/* Futuristic background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-[32vw] h-[32vw] bg-secondary/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-accent via-secondary to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_24px_rgba(100,255,218,0.25)]">What We Offer</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto bg-gradient-to-r from-secondary via-accent/90 to-secondary text-transparent bg-clip-text animate-gradient">Comprehensive solutions for your digital needs</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-8 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.03] shadow-2xl border border-accent/20 bg-[#101a2f]/80 backdrop-blur-lg"
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
        <div className="max-w-4xl mx-auto mt-24 mb-16 animate-fade-in delay-200 bg-[#101a2f]/80 backdrop-blur-lg rounded-2xl shadow-xl border border-accent/20 p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-accent via-secondary to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_16px_rgba(100,255,218,0.15)]">Why Choose Us</h2>
          <ul className="space-y-4 text-lg text-gray-200 list-disc list-inside">
            <li>Fast delivery, clean code, and pixel-perfect design.</li>
            <li>Transparent pricing and clear communication.</li>
            <li>Built with modern tools like Next.js, Flutter, Firebase, and Tailwind CSS.</li>
            <li>High client satisfaction and repeat business.</li>
            <li>Scalable solutions for startups and enterprises.</li>
            <li>Ongoing learning and adoption of the latest technologies.</li>
            <li>Dedicated post-launch support and maintenance.</li>
            <li>Strong focus on security and best practices.</li>
          </ul>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-24 animate-fade-in delay-300 bg-[#101a2f]/80 backdrop-blur-lg rounded-2xl shadow-xl border border-accent/20 p-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-accent via-secondary to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_16px_rgba(100,255,218,0.15)]">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">How long does a typical project take?</h3>
              <p className="text-gray-300">Most projects are delivered in 2–6 weeks depending on complexity.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">Do you offer post-launch support?</h3>
              <p className="text-gray-300">Yes, we offer maintenance and feature updates as needed.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">What are your payment terms?</h3>
              <p className="text-gray-300">We typically require a 30% upfront deposit, with the remainder due upon project completion.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">How many revisions are included?</h3>
              <p className="text-gray-300">We include up to 2 rounds of revisions to ensure your satisfaction.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">What is your project process?</h3>
              <p className="text-gray-300">We follow a transparent process: discovery, design, development, testing, and launch.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">Is my project information confidential?</h3>
              <p className="text-gray-300">Absolutely. We sign NDAs and treat your information with the utmost confidentiality.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-accent mb-2">Can you work with my existing team?</h3>
              <p className="text-gray-300">Yes, we can collaborate with your in-house developers or designers.</p>
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