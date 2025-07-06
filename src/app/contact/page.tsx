'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTheme } from '../context/ThemeContext'

function ContactForm() {
  const searchParams = useSearchParams()
  const serviceParam = searchParams.get('service')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: serviceParam ? `Hi, I'm interested in your ${serviceParam} service. Please provide more details about pricing and timeline.` : ''
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme();
  const [showToast, setShowToast] = useState(false)
  const toastTimeout = useRef<NodeJS.Timeout | null>(null)

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')
    setSent(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        setSent(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setErrors({})
        setShowToast(true)
        if (toastTimeout.current) clearTimeout(toastTimeout.current)
        toastTimeout.current = setTimeout(() => setShowToast(false), 4000)
      } else {
        setError(data.error || 'Failed to send message.')
      }
    } catch (err) {
      setError('Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--surface)] to-[var(--background)]">
      {/* Futuristic background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="absolute bottom-0 right-0 w-[32vw] h-[32vw] bg-secondary/20 rounded-full blur-3xl animate-pulse-slow z-0"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 mt-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#64ffda] via-blue-400 to-purple-500 text-transparent bg-clip-text animate-gradient drop-shadow-[0_2px_24px_rgba(100,255,218,0.25)]">
            Get in Touch
          </h1>
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto mt-2 text-center transition-colors duration-500 ${theme === 'light' ? 'text-[#1e293b]' : 'text-[#cbd5e1]'}`}>
            Reach out and let&apos;s start a conversation about your goals, ideas, or next big thing!
          </p>
        </div>
        {/* Contact Form Section */}
        <div className="max-w-4xl mx-auto">
          <div
            className={`p-8 md:p-12 rounded-2xl relative overflow-hidden group shadow-xl backdrop-blur-lg border transition-colors duration-500 
              ${theme === 'light' ? 'bg-[#c8d6e5] border-[var(--accent)]/40' : 'bg-[#101a2f] border-[#233554]'}`}
          >
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-90 transition-colors duration-500 
              ${theme === 'light' ? 'from-[#c8d6e5] via-[#e9eef3] to-[#f4f7fa]' : 'from-[#101a2f] via-[#101a2f] to-[#0a192f]'}`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#64ffda]/10 via-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            {/* Form Content */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block mb-2 text-sm font-semibold transition-colors duration-500 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`}>Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-300
                      ${theme === 'light' ? 'bg-white border-[var(--accent)]/40 text-[var(--text)] placeholder-[var(--text-secondary)]' : 'bg-[#112240] border-[var(--accent)]/20 text-[#f1f5f9] placeholder-gray-400'}
                      ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                    required
                  />
                  {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className={`block mb-2 text-sm font-semibold transition-colors duration-500 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-300
                      ${theme === 'light' ? 'bg-white border-[var(--accent)]/40 text-[var(--text)] placeholder-[var(--text-secondary)]' : 'bg-[#112240] border-[var(--accent)]/20 text-[#f1f5f9] placeholder-gray-400'}
                      ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="john@example.com"
                    required
                  />
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold transition-colors duration-500 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`}>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-300
                    ${theme === 'light' ? 'bg-white border-[var(--accent)]/40 text-[var(--text)] placeholder-[var(--text-secondary)]' : 'bg-[#112240] border-[var(--accent)]/20 text-[#f1f5f9] placeholder-gray-400'}
                    ${errors.subject ? 'border-red-500' : ''}`}
                  placeholder="Project Discussion"
                  required
                />
                {errors.subject && <p className="text-red-400 text-sm mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className={`block mb-2 text-sm font-semibold transition-colors duration-500 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`}>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-300 min-h-[150px]
                    ${theme === 'light' ? 'bg-white border-[var(--accent)]/40 text-[var(--text)] placeholder-[var(--text-secondary)]' : 'bg-[#112240] border-[var(--accent)]/20 text-[#f1f5f9] placeholder-gray-400'}
                    ${errors.message ? 'border-red-500' : ''}`}
                  placeholder="Tell me about your project..."
                  required
                ></textarea>
                {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[var(--accent)] to-blue-400 text-[var(--background)] hover:from-blue-400 hover:to-[var(--accent)] transition-all duration-500 py-3 rounded-lg font-medium transform hover:scale-[1.02]"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
          {/* WhatsApp Chat Button */}
          <div className="flex justify-center mt-8">
            <a
              href="https://wa.me/919945546164"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] text-lg
                ${theme === 'light' ? 'bg-[#25D366] text-[#0a192f] hover:bg-[#1ebe5d]' : 'bg-[#25D366] text-[#0a192f] hover:bg-[#1ebe5d]'}`}
              aria-label="Chat on WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M20.52 3.48A12.07 12.07 0 0012 0C5.37 0 0 5.37 0 12a11.93 11.93 0 001.64 6.06L0 24l6.31-1.65A12.09 12.09 0 0012 24c6.63 0 12-5.37 12-12a11.93 11.93 0 00-3.48-8.52zM12 22a9.93 9.93 0 01-5.09-1.39l-.36-.21-3.75.98.99-3.65-.23-.37A9.94 9.94 0 1122 12a9.93 9.93 0 01-10 10zm5.47-7.14c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.77-1.68-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5 0 1.48 1.08 2.91 1.23 3.11.15.2 2.13 3.25 5.17 4.42.72.25 1.28.4 1.72.51.72.18 1.38.15 1.9.09.58-.07 1.77-.72 2.02-1.41.25-.7.25-1.3.17-1.41-.08-.11-.27-.18-.57-.33z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
          {/* Contact Info */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className={`w-6 h-6 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                ),
                title: 'Email',
                value: <a href="mailto:contact@atomsinnovation.com" className={`mt-2 block transition-colors duration-300 ${theme === 'light' ? 'text-[var(--text)] hover:text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'}`}>contact@atomsinnovation.com</a>
              },
              {
                icon: (
                  <svg className={`w-6 h-6 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                ),
                title: 'Phone',
                value: <a href="tel:+919945546164" className={`mt-2 block transition-colors duration-300 ${theme === 'light' ? 'text-[var(--text)] hover:text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'}`}>+91 9945546164</a>
              },
              {
                icon: (
                  <svg className={`w-6 h-6 ${theme === 'light' ? 'text-[#274690]' : 'text-[#64ffda]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ),
                title: 'Working Hours',
                value: <><p className={`mt-2 ${theme === 'light' ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>Monday - Saturday</p><p className={`${theme === 'light' ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'}`}>9:00 AM - 6:00 PM IST</p></>
              }
            ].map((info) => (
              <div key={info.title} className={`text-center group rounded-2xl shadow-lg p-6 backdrop-blur-lg border transition-colors duration-500 
                ${theme === 'light' ? 'bg-[#c8d6e5] border-[var(--accent)]/40' : 'bg-[#101a2f] border-[#233554]'}`}>
                <div className="inline-block p-4 rounded-full bg-[var(--surface)]/50 border border-[var(--accent)]/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {info.icon}
                </div>
                <h3 className={`text-lg font-semibold bg-gradient-to-r text-transparent bg-clip-text animate-gradient mb-1 
                  ${theme === 'light' ? 'from-[#274690] to-blue-400' : 'from-[#64ffda] to-blue-400'}`}>{info.title}</h3>
                {info.value}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Toast Message */}
      {showToast && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in">
          <span>Thank you! Your message has been sent.</span>
          <button onClick={() => setShowToast(false)} className="ml-2 text-white hover:text-green-200 focus:outline-none">&times;</button>
        </div>
      )}
    </div>
  )
}

export default ContactForm