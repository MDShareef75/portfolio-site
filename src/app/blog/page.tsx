'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const categories = ['All', 'Web Dev', 'Mobile Dev', 'AI/ML', 'DevOps']

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  image: string
  author: string
  tags: string[]
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Getting Started with Next.js 13 App Router",
    excerpt: "Explore the new features and improvements in Next.js 13, including the revolutionary App Router, Server Components, and enhanced performance optimizations.",
    content: `
      Next.js 13 represents a significant leap forward in React development, introducing several game-changing features that enhance both developer experience and application performance.

      Key Features:
      • App Router: A more intuitive file-system based router
      • Server Components: Reduced client-side JavaScript
      • Improved Data Fetching: More efficient data loading patterns
      • Enhanced Image Optimization: Better performance and user experience
      • Streaming: Progressive rendering for faster page loads

      The new App Router in Next.js 13 provides a more intuitive way to handle routing in your applications. It's built on top of React's latest features and follows a file-system based approach, making it easier to understand and maintain your application's structure.

      Server Components are another revolutionary feature, allowing components to be rendered on the server by default. This results in smaller JavaScript bundles sent to the client, improving initial page load times and overall performance.
    `,
    category: "Web Dev",
    date: "March 15, 2024",
    readTime: "8 min read",
    image: "https://placehold.co/800x400/0a192f/64ffda.png?text=Next.js+13",
    author: "Mohammed Shareef",
    tags: ["Next.js", "React", "Web Development", "JavaScript"]
  },
  {
    id: 2,
    title: "Building Cross-Platform Apps with Flutter vs React Native",
    excerpt: "A comprehensive comparison of Flutter and React Native for mobile app development, including performance benchmarks, developer experience, and use cases.",
    content: `
      When it comes to cross-platform mobile development, Flutter and React Native stand out as the leading frameworks. Each has its unique strengths and considerations.

      Flutter Advantages:
      • Single codebase for multiple platforms
      • Hot Reload for rapid development
      • Rich set of customizable widgets
      • Excellent performance with Dart
      • Strong Google support

      React Native Benefits:
      • Large community and ecosystem
      • JavaScript/React familiarity
      • Native-like performance
      • Easy integration with native modules
      • Proven track record

      Performance Comparison:
      Flutter generally offers better performance due to its direct compilation to native code and its own rendering engine. React Native, while still performant, relies on a JavaScript bridge which can impact performance in complex applications.

      Development Experience:
      Both frameworks offer excellent developer experiences but in different ways. Flutter's hot reload and extensive widget library make UI development particularly smooth. React Native's familiar React paradigm and JavaScript ecosystem make it easier for web developers to transition to mobile development.
    `,
    category: "Mobile Dev",
    date: "March 10, 2024",
    readTime: "10 min read",
    image: "https://placehold.co/800x400/0a192f/64ffda.png?text=Flutter+vs+React+Native",
    author: "Mohammed Shareef",
    tags: ["Flutter", "React Native", "Mobile Development", "Cross-Platform"]
  },
  {
    id: 3,
    title: "AI Integration in Modern Web Applications",
    excerpt: "Learn how to integrate AI capabilities into your web applications using OpenAI, TensorFlow.js, and other cutting-edge machine learning tools.",
    content: `
      Artificial Intelligence is revolutionizing web applications, enabling more intelligent and personalized user experiences. This guide explores practical implementations of AI features in web applications.

      Key Implementation Areas:
      • Natural Language Processing (NLP)
      • Image Recognition and Processing
      • Predictive Analytics
      • Chatbots and Virtual Assistants
      • Recommendation Systems

      Tools and Technologies:
      • TensorFlow.js for client-side ML
      • OpenAI API for advanced AI capabilities
      • Hugging Face for NLP tasks
      • Custom ML models with Python
      • Cloud AI services (AWS, Google Cloud, Azure)

      Best Practices:
      • Consider privacy and data protection
      • Optimize for performance
      • Implement proper error handling
      • Ensure accessibility
      • Monitor and analyze AI feature usage

      The integration of AI features should enhance user experience without compromising application performance or accessibility. This requires careful consideration of implementation approaches and thorough testing.
    `,
    category: "AI/ML",
    date: "March 5, 2024",
    readTime: "12 min read",
    image: "https://placehold.co/800x400/0a192f/64ffda.png?text=AI+Integration",
    author: "Mohammed Shareef",
    tags: ["AI", "Machine Learning", "Web Development", "Innovation"]
  },
  {
    id: 4,
    title: "DevOps Best Practices for Small Teams",
    excerpt: "Discover essential DevOps practices that can help small development teams improve their deployment pipeline and maintain high-quality code.",
    content: `
      DevOps practices are crucial for modern web application development, ensuring efficient development, reliable deployment, and robust maintenance processes.

      Key DevOps Practices:
      • Continuous Integration/Continuous Deployment (CI/CD)
      • Infrastructure as Code (IaC)
      • Containerization with Docker
      • Orchestration with Kubernetes
      • Automated Testing and Monitoring

      Essential Tools:
      • GitHub Actions for CI/CD
      • Docker for containerization
      • Kubernetes for orchestration
      • Terraform for infrastructure
      • Prometheus and Grafana for monitoring

      Implementation Strategy:
      1. Start with version control
      2. Implement automated testing
      3. Set up CI/CD pipelines
      4. Deploy containerized applications
      5. Monitor and optimize performance

      The key to successful DevOps implementation is choosing the right tools and practices that align with your team's needs and project requirements.
    `,
    category: "DevOps",
    date: "February 28, 2024",
    readTime: "15 min read",
    image: "https://placehold.co/800x400/0a192f/64ffda.png?text=DevOps+Practices",
    author: "Mohammed Shareef",
    tags: ["DevOps", "CI/CD", "Docker", "Kubernetes"]
  },
  {
    id: 5,
    title: "Building Scalable APIs with Node.js and TypeScript",
    excerpt: "A guide to building robust, type-safe APIs using Node.js and TypeScript, covering best practices for architecture, testing, and deployment.",
    content: `
      Node.js has become a go-to choice for building scalable backend systems. This guide covers essential concepts and best practices for creating robust backend architectures.

      Architecture Patterns:
      • Microservices Architecture
      • Event-Driven Architecture
      • RESTful API Design
      • GraphQL Implementation
      • Message Queues

      Performance Optimization:
      • Database Query Optimization
      • Caching Strategies
      • Load Balancing
      • Memory Management
      • Error Handling

      Scalability Considerations:
      • Horizontal vs Vertical Scaling
      • Database Sharding
      • Microservices Communication
      • API Gateway Implementation
      • Service Discovery

      Security Best Practices:
      • Authentication & Authorization
      • Data Encryption
      • Input Validation
      • Rate Limiting
      • Security Headers
    `,
    category: "Web Dev",
    date: "February 20, 2024",
    readTime: "14 min read",
    image: "https://placehold.co/800x400/0a192f/64ffda.png?text=Node.js+APIs",
    author: "Mohammed Shareef",
    tags: ["Node.js", "Backend", "Scalability", "Architecture"]
  }
]

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient">
            Tech Blog
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto bg-gradient-to-r from-blue-200 via-[#64ffda]/90 to-blue-200 text-transparent bg-clip-text animate-gradient">
            Insights, tutorials, and thoughts on modern web and mobile development
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Search Bar */}
          <div className="glassmorphism-card p-6 rounded-xl mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-12 py-3 bg-[#233554]/50 border border-[#64ffda]/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#64ffda] focus:border-transparent transition-all duration-300"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full transition-all duration-500 transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] font-semibold shadow-lg shadow-[#64ffda]/20'
                    : 'bg-[#112240]/30 text-gray-300 hover:bg-[#112240]/50 hover:text-[#64ffda] border border-[#233554]/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.02]"
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#112240]/90 via-[#112240] to-[#0a192f] opacity-90"></div>

              {/* Post Image */}
              <div className="relative aspect-video">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-[#0a192f]/50 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#64ffda] text-[#0a192f] text-sm rounded-full font-medium">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="relative p-6 z-10">
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-[#64ffda] via-blue-400 to-[#64ffda] text-transparent bg-clip-text group-hover:animate-gradient">
                  {post.title}
                </h2>

                <p className="text-gray-300 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <a
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center text-[#64ffda] group-hover:text-blue-400 transition-colors duration-300"
                >
                  Read More
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </article>
          ))}
        </div>

        {/* No Posts Message */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 animate-bounce">📝</div>
            <h3 className="text-xl text-[#64ffda] mb-2">No posts found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-[#112240] p-8 rounded-2xl text-center shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">Subscribe to get notified about new articles and tutorials</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-[#233554] border border-[#64ffda]/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#64ffda] focus:border-transparent transition-all duration-300"
              />
              <button className="bg-[#64ffda] text-[#0a192f] hover:bg-[#64ffda]/90 transition-colors duration-300 px-6 py-3 rounded-lg font-medium whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 