'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { blogPosts, BlogPost } from './data'

const categories = ['All', 'Web Dev', 'Mobile Dev', 'AI/ML', 'DevOps']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Please enter a valid email address.')
    } else {
      setEmailError('')
    }
  }

  const handleSubscribe = async () => {
    if (!email || emailError) {
      setEmailError('Please enter a valid email address.')
      return
    }
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true)
      } else {
        setEmailError('Subscription failed. Please try again.')
      }
    } catch (error) {
      setEmailError('An error occurred. Please try again.')
    }
  }

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
        <div className="text-center mb-16 mt-16">
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
            {subscribed ? (
              <p className="text-[#64ffda]">Thank you for subscribing!</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    className={`w-full px-4 py-3 bg-[#233554] border ${emailError ? 'border-red-500' : 'border-[#64ffda]/20'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#64ffda] focus:border-transparent transition-all duration-300`}
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                <button 
                  onClick={handleSubscribe}
                  className="bg-[#64ffda] text-[#0a192f] hover:bg-[#64ffda]/90 transition-colors duration-300 px-6 py-3 rounded-lg font-medium whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 