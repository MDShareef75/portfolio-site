'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TicketIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TagIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface FormData {
  referralCode: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  referralCode?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ClientSignup() {
  const [formData, setFormData] = useState<FormData>({
    referralCode: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [step, setStep] = useState<1 | 2>(1);

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    // Referral code validation (optional)
    if (formData.referralCode && formData.referralCode.trim() && !/^ATOM\d{4}$/.test(formData.referralCode.toUpperCase())) {
      newErrors.referralCode = 'Invalid referral code format (e.g., ATOM1234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

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

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep1()) return;

    setIsSubmitting(true);

    try {
      // Only validate referral code if one is provided
      if (formData.referralCode && formData.referralCode.trim()) {
        const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/validateReferralCode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            referralCode: formData.referralCode.toUpperCase()
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStep(2);
        } else {
          setErrors({ referralCode: data.error || 'Invalid referral code' });
        }
      } else {
        // No referral code provided, proceed to step 2
        setStep(2);
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setErrors({ referralCode: 'Network error. Please try again.' });
    }

    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const requestBody = {
        referralCode: formData.referralCode ? formData.referralCode.toUpperCase() : '',
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone,
        password: formData.password
      };

      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/clientSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
        setErrors({ referralCode: data.error || 'Failed to create account' });
      }
    } catch (error) {
      console.error('Error creating client account:', error);
      setSubmitStatus('error');
      setErrors({ referralCode: 'Network error. Please try again.' });
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-green-500/30 p-8 w-full max-w-md text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6"
          >
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-4">Welcome Aboard! 🎉</h1>
          <p className="text-gray-300 mb-6">Your account has been created successfully!</p>

          {formData.referralCode && formData.referralCode.trim() && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 mb-6 border border-green-500/30">
              <div className="flex items-center justify-center mb-3">
                <TagIcon className="w-6 h-6 text-green-400 mr-2" />
                <span className="text-green-400 font-semibold">25% Discount Applied!</span>
              </div>
              <p className="text-white text-sm">
                You've received a <span className="font-bold text-green-400">25% discount</span> on your project thanks to your referral code!
              </p>
            </div>
          )}

          <div className="space-y-3 text-sm text-gray-300 mb-6">
            <p>✨ Your discount has been automatically applied</p>
            <p>💼 We'll contact you shortly to discuss your project</p>
            <p>🚀 Get ready for an amazing development experience!</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/client-portal"
              className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
            >
              Access Client Portal
            </Link>
            <Link
              href="/"
              className="block w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-4">
            <UserPlusIcon className="w-8 h-8 text-white" />
          </div>
                      <h1 className="text-3xl font-bold text-white mb-2">Join Atoms Innovation</h1>
                      <p className="text-gray-300">Get 25% discount with a referral code!</p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 rounded-full ${
              step >= 2 ? 'bg-purple-500' : 'bg-gray-600'
            }`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ x: step === 1 ? -20 : 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6 md:p-8"
        >
          {step === 1 ? (
            // Step 1: Referral Code
            <div>
                              <h2 className="text-xl font-bold text-white mb-6 text-center">Referral Code (Optional)</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
                    Referral Code (Optional - Get 25% Discount!)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <TicketIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={(e) => handleInputChange('referralCode', e.target.value.toUpperCase())}
                      className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                        errors.referralCode ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors uppercase tracking-wider text-center text-lg font-mono`}
                                              placeholder="ATOM1234 (optional)"
                      maxLength={8}
                    />
                  </div>
                  {errors.referralCode && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center"
                    >
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.referralCode}
                    </motion.p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
                  <div className="flex items-center text-yellow-300 mb-2">
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Special Offer!</span>
                  </div>
                  <p className="text-white text-sm">
                    Get <span className="font-bold text-yellow-400">25% OFF</span> on your entire project with a valid referral code, or skip to continue without discount!
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
                    isSubmitting
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Validating Code...
                    </div>
                  ) : (
                    'Continue'
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            // Step 2: Personal Information
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  Back
                </button>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
                <div className="w-12" /> {/* Spacer */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center"
                    >
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
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
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors`}
                      placeholder="john@example.com"
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
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
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
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors`}
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
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
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
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors`}
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
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-3 py-3 bg-white/10 border ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors`}
                      placeholder="Confirm your password"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-xs mt-1 flex items-center"
                    >
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.confirmPassword}
                    </motion.p>
                  )}
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
                      : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/25'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    '🎯 Create Account & Get 25% OFF'
                  )}
                </motion.button>


              </form>
            </div>
          )}

          {/* Benefits Section */}
          {step === 1 && (
            <div className="mt-6 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-4 border border-purple-500/30">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center">
                <TagIcon className="w-4 h-4 mr-2 text-purple-400" />
                What you get:
              </h4>
              <div className="space-y-1 text-gray-300 text-xs">
                <p>✨ 25% discount on total project cost</p>
                <p>🚀 Priority support & faster delivery</p>
                <p>💼 Dedicated project manager</p>
                <p>🔒 Your referrer earns ₹500 when you pay Step 1</p>
              </div>
            </div>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link href="/client-portal" className="text-purple-400 hover:text-purple-300 underline">
                Login here
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-gray-400 text-xs mt-4 text-center">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 