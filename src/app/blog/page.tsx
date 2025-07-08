'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { blogPosts, BlogPost } from './data'
import SocialShare from '../components/SocialShare'
import { useTheme } from '../context/ThemeContext'

const categories = ['All', 'Web Dev', 'Mobile Dev', 'AI/ML', 'DevOps', 'Tutorial', 'Best Practices']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    if (newEmail && !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(newEmail)) {
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
    
    setLoading(true)
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
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme === 'light' ? 'bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)]' : 'bg-gradient-to-br from-[#0a192f] via-[#101a2f] to-[#1a223f]'}`}>
      {/* Futuristic background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-[32vw] h-[32vw] bg-secondary/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16 animate-fade-in">
          <h1 className={`text-5xl md:text-6xl font-bold pb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_24px_rgba(100,255,218,0.25)]`}>
            Blog
          </h1>
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto mt-2 text-center transition-colors duration-500 ${theme === 'light' ? 'text-[#1e293b]' : 'text-[#cbd5e1]'}`}>
            Insights, tutorials, and stories from our team on web, mobile, and tech innovation.
          </p>
        </div>
        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Search Bar on top */}
          <div className="w-full mb-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-5 py-4 pl-12 text-lg rounded-xl focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-300 shadow-lg
                  ${theme === 'light'
                    ? 'bg-[var(--surface)]/60 border border-[var(--accent)]/30 text-[var(--text)] placeholder-[var(--text-secondary)]'
                    : 'bg-[#112240]/60 border border-[#64ffda]/30 text-white placeholder-gray-400'}`}
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          {/* Filter Buttons below search bar */}
          <div className="flex flex-wrap gap-2 items-center justify-start">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full transition-all duration-300 text-sm ${
                  activeCategory === category
                    ? 'bg-[#64ffda] text-[#0a192f] font-semibold shadow-lg'
                    : 'bg-[#112240]/50 text-gray-300 hover:bg-[#112240] hover:text-[#64ffda] border border-[#64ffda]/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {/* Results Count */}
          <div className="text-center mt-4 text-gray-400">
            {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-8 max-w-7xl mx-auto">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className={`group relative overflow-hidden rounded-2xl transition-all duration-500 transform hover:scale-[1.03] border backdrop-blur-lg flex flex-col justify-between
                ${theme === 'light' ? 'bg-white border-[var(--accent)]/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)]' : 'border-accent/20 bg-[var(--surface)]/80 shadow-2xl'}`}
            >
              {/* Card Background */}
              {theme === 'dark' && (
              <div className="absolute inset-0 bg-gradient-to-br from-[#112240]/90 via-[#112240] to-[#0a192f] opacity-90"></div>
              )}
              {/* Post Image */}
              <div className="relative aspect-video">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${theme === 'light' ? 'bg-[var(--accent)] text-[var(--background)]' : 'bg-[#64ffda] text-[#0a192f]'}`}>{post.category}</span>
                </div>
              </div>
              {/* Post Content */}
              <div className={`relative p-6 z-10 ${theme === 'light' ? '' : ''}`}>
                <div className={`flex items-center text-sm mb-3 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 className={`text-xl font-bold mb-3 transition-colors duration-500 ${theme === 'light' ? 'text-[#1e293b]' : 'bg-gradient-to-r from-[#64ffda] via-blue-400 to-[#64ffda] text-transparent bg-clip-text group-hover:animate-gradient'}`}>{post.title}</h2>
                <p className={`mb-4 line-clamp-3 transition-colors duration-500 ${theme === 'light' ? 'text-[#475569]' : 'text-gray-300'}`}>{post.excerpt}</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.location.href = `/blog/${post.id}`}
                      className={`inline-flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-lg px-4 py-2 font-medium text-base border shadow-sm
                        ${theme === 'light'
                          ? 'text-[#0891b2] border-[#0891b2] bg-white hover:bg-[var(--accent)]/10 hover:text-[#2260a9]'
                          : 'text-[#64ffda] border-[#64ffda] bg-[#112240] hover:bg-[#233554] hover:text-blue-400'}`}
                      aria-label={`Read more about ${post.title}`}
                      type="button"
                >
                  Read More
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                    </button>
                  </div>
                  <SocialShare
                    url={`${window.location.origin}/blog/${post.id}`}
                    title={post.title}
                    description={post.excerpt}
                    hashtags={post.tags}
                  />
                </div>
              </div>
              {/* Hover Effect */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${theme === 'light' ? 'opacity-0' : 'bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100'}`}></div>
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
        {/* Enhanced Newsletter Signup */}
        <div className="max-w-4xl mx-auto mt-20">
          <div className="bg-gradient-to-br from-[#101a2f]/90 to-[#112240]/90 border border-accent/20 p-8 md:p-12 rounded-2xl text-center shadow-xl backdrop-blur-lg relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/5 via-blue-400/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-2">Get the latest insights, tutorials, and tech updates</p>
              <p className="text-sm text-gray-400 mb-6">No spam, unsubscribe anytime</p>
              
            {subscribed ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-[#64ffda] text-lg font-semibold">Thank you for subscribing!</p>
                  <p className="text-gray-400 text-sm mt-2">You'll receive our next newsletter soon.</p>
                </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <input
                    type="email"
                      placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                      className={`w-full px-4 py-3 bg-[#233554]/50 border ${emailError ? 'border-red-500' : 'border-[#64ffda]/20'} rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#64ffda] focus:border-transparent transition-all duration-300`}
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                <button 
                  onClick={handleSubscribe}
                  disabled={loading}
                    className="bg-gradient-to-r from-[#64ffda] to-blue-400 text-[#0a192f] hover:from-blue-400 hover:to-[#64ffda] transition-all duration-300 px-6 py-3 rounded-lg font-medium whitespace-nowrap disabled:bg-gray-500 disabled:cursor-not-allowed transform hover:scale-105"
                >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0a192f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Subscribing...
                      </span>
                    ) : (
                      'Subscribe'
                    )}
                </button>
              </div>
            )}
              
              <div className="mt-6 text-xs text-gray-500">
                <p>By subscribing, you agree to our privacy policy and terms of service.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 