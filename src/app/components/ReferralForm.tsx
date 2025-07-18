'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface ReferralFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  email: string;
  phone: string;
  password: string;
  upi: string;
}

interface FormErrors {
  email?: string;
  phone?: string;
  password?: string;
  upi?: string;
}

export default function ReferralForm({ isOpen, onClose }: ReferralFormProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    password: '',
    upi: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // UPI validation (optional)
    if (formData.upi && formData.upi.length > 0) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(formData.upi)) {
        newErrors.upi = 'Please enter a valid UPI ID (e.g., user@paytm)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/generateReferralCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          phone: formData.phone,
          password: formData.password,
          upi: formData.upi || formData.phone // Use phone as UPI if not provided
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setGeneratedCode(data.referralCode);
      } else {
        setSubmitStatus('error');
        setErrors({ email: data.error || 'Failed to generate referral code' });
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      setSubmitStatus('error');
      setErrors({ email: 'Network error. Please try again.' });
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleClose = () => {
    setFormData({ email: '', phone: '', password: '', upi: '' });
    setErrors({});
    setSubmitStatus('idle');
    setGeneratedCode('');
    onClose();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative max-w-md w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>

          <div className="relative p-6">
            {submitStatus === 'success' ? (
              // Success State
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4"
                >
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">Success! 🎉</h2>
                <p className="text-gray-300 mb-6">Your referral code has been generated successfully!</p>

                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-4 mb-6 border border-cyan-500/30">
                  <p className="text-cyan-400 text-sm mb-2">Your Referral Code:</p>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span className="text-2xl font-bold text-white tracking-wider">{generatedCode}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(generatedCode)}
                      className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </motion.button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 mb-6 border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm mb-2 font-semibold">🔐 Your Password:</p>
                  <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                    <span className="text-lg font-mono text-white tracking-wider">{formData.password}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(formData.password)}
                      className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
                    >
                      Copy
                    </motion.button>
                  </div>
                  <p className="text-yellow-300 text-xs mt-2 font-semibold">
                    ⚠️ Please remember this password! You'll need it to check your referral status later.
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-300 mb-6">
                  <p>✨ Share this code with your friends</p>
                  <p>💰 Earn ₹500 when they pay Step 1</p>
                  <p>🎯 Max 10 referrals per account</p>
                </div>

                {/* Social Media Share Buttons */}
                <div className="space-y-4 mb-6">
                  <h4 className="text-lg font-semibold text-white text-center">📢 Share on Social Media</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp */}
                                         <motion.a
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       href={`https://wa.me/?text=🚀 Hey! I found an amazing web development service! Use my referral code "${generatedCode}" and get exclusive benefits. Check out Atom's Innovation: https://www.atomsinnovation.com/ 💻✨`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                     >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z"/>
                      </svg>
                      WhatsApp
                    </motion.a>

                    {/* Facebook */}
                                         <motion.a
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       href={`https://www.facebook.com/sharer/sharer.php?u=https://www.atomsinnovation.com/&quote=🚀 Check out Atom's Innovation for amazing web development services! Use my referral code "${generatedCode}" for exclusive benefits! 💻✨`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                     >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </motion.a>

                    {/* Twitter */}
                                         <motion.a
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       href={`https://twitter.com/intent/tweet?text=🚀 Amazing web development services at Atom's Innovation! Use my referral code "${generatedCode}" for exclusive benefits! 💻✨&url=https://www.atomsinnovation.com/&hashtags=WebDevelopment,AtomInnovation,ReferralCode`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors text-sm"
                     >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </motion.a>

                    {/* LinkedIn */}
                                         <motion.a
                       whileHover={{ scale: 1.05 }}
                       whileTap={{ scale: 0.95 }}
                       href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.atomsinnovation.com/&title=Atom's Innovation - Web Development Services&summary=🚀 Check out amazing web development services! Use my referral code "${generatedCode}" for exclusive benefits! 💻✨`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm"
                     >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </motion.a>
                  </div>

                  {/* Copy Share Message */}
                  <div className="p-3 bg-white/5 rounded-lg border border-cyan-500/20">
                    <p className="text-cyan-400 text-xs font-semibold mb-2">📋 Copy & Share Message:</p>
                                         <div className="bg-white/10 rounded p-2 text-left text-xs text-gray-300 mb-2">
                       🚀 Hey! I found an amazing web development service! Use my referral code "<span className="text-white font-bold">{generatedCode}</span>" and get exclusive benefits. Check out Atom's Innovation: https://www.atomsinnovation.com/ 💻✨
                     </div>
                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => {
                         const shareMessage = `🚀 Hey! I found an amazing web development service! Use my referral code "${generatedCode}" and get exclusive benefits. Check out Atom's Innovation: https://www.atomsinnovation.com/ 💻✨`;
                         navigator.clipboard.writeText(shareMessage);
                       }}
                       className="w-full px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded transition-colors"
                     >
                      📋 Copy Message
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClose}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Done
                  </motion.button>
                  
                  <motion.a
                    href="/referrer-generate"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                  >
                    🎁 Generate More Codes
                  </motion.a>
                  
                  <motion.a
                    href="/referrer-status"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
                  >
                    📊 Check My Status Later
                  </motion.a>
                </div>
              </motion.div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4"
                  >
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">Generate Referral Code</h2>
                  <p className="text-gray-300 text-sm">Create your unique code and start earning!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-cyan-400 text-sm font-semibold mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                          errors.email ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1 flex items-center"
                      >
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-cyan-400 text-sm font-semibold mb-2">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                          errors.phone ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors`}
                        placeholder="9876543210"
                      />
                    </div>
                    {errors.phone && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1 flex items-center"
                      >
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        {errors.phone}
                      </motion.p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-cyan-400 text-sm font-semibold mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                          errors.password ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors`}
                        placeholder="Create a password"
                      />
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1 flex items-center"
                      >
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        {errors.password}
                      </motion.p>
                    )}
                    <p className="text-yellow-300 text-xs mt-1 font-semibold">
                      ⚠️ Remember this password! You'll need it to check your referral status later.
                    </p>
                  </div>

                  {/* UPI Field (Optional) */}
                  <div>
                    <label className="block text-cyan-400 text-sm font-semibold mb-2">
                      UPI ID (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCardIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.upi}
                        onChange={(e) => handleInputChange('upi', e.target.value)}
                        className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                          errors.upi ? 'border-red-500' : 'border-gray-600'
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors`}
                        placeholder="yourname@paytm"
                      />
                    </div>
                    {errors.upi && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1 flex items-center"
                      >
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        {errors.upi}
                      </motion.p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      If not provided, we'll use your phone number for UPI payments
                    </p>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
                      isSubmitting
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg hover:shadow-cyan-500/25'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Code...
                      </div>
                    ) : (
                      '🚀 Generate My Referral Code'
                    )}
                  </motion.button>
                </form>

                {/* Info Box */}
                <div className="mt-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-500/30">
                  <h4 className="text-white font-semibold text-sm mb-2">How it works:</h4>
                  <div className="space-y-1 text-gray-300 text-xs">
                    <p>1. Generate your unique referral code</p>
                    <p>2. Share with friends & family</p>
                    <p>3. They get 25% discount on projects</p>
                    <p>4. You earn ₹500 when they pay Step 1</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 