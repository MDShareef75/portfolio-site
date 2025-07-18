'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  TicketIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
  TagIcon
} from '@heroicons/react/24/solid';

interface ClientSignupFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  referralCode: string;
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  referralCode?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function ClientSignupForm({ isOpen, onClose }: ClientSignupFormProps) {
  const [formData, setFormData] = useState<FormData>({
    referralCode: '',
    name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Referral code validation (optional)
    if (formData.referralCode && formData.referralCode.trim() && !/^ATOM\d{4}$/.test(formData.referralCode.toUpperCase())) {
      newErrors.referralCode = 'Invalid referral code format (e.g., ATOM1234)';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/clientSignup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode: formData.referralCode ? formData.referralCode.toUpperCase() : '',
          name: formData.name.trim(),
          email: formData.email.toLowerCase(),
          phone: formData.phone
        }),
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

  const handleClose = () => {
    setFormData({ referralCode: '', name: '', email: '', phone: '' });
    setErrors({});
    setSubmitStatus('idle');
    onClose();
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
          className="relative max-w-md w-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-pink-500/20 animate-pulse"></div>
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

                <h2 className="text-2xl font-bold text-white mb-2">Welcome Aboard! 🎉</h2>
                <p className="text-gray-300 mb-6">Your account has been created successfully!</p>

                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 mb-6 border border-green-500/30">
                  <div className="flex items-center justify-center mb-3">
                    <TagIcon className="w-6 h-6 text-green-400 mr-2" />
                    <span className="text-green-400 font-semibold">25% Discount Applied!</span>
                  </div>
                  <p className="text-white text-sm">
                    You've received a <span className="font-bold text-green-400">25% discount</span> on your project thanks to your referral code!
                  </p>
                </div>

                <div className="space-y-3 text-sm text-gray-300 mb-6">
                  <p>✨ Your discount has been automatically applied</p>
                  <p>💼 We'll contact you shortly to discuss your project</p>
                  <p>🚀 Get ready for an amazing development experience!</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                >
                  Get Started
                </motion.button>
              </motion.div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-4"
                  >
                    <UserPlusIcon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-2">Join with Referral Code</h2>
                  <p className="text-gray-300 text-sm">Get 25% discount on your project!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Referral Code Field */}
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
                        } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors uppercase tracking-wider`}
                        placeholder="ATOM1234 (for 25% discount)"
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
                      '🎯 Join & Get 25% Discount'
                    )}
                  </motion.button>
                </form>

                {/* Discount Info Box */}
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

                {/* Terms */}
                <p className="text-gray-400 text-xs mt-4 text-center">
                  By signing up, you agree to our Terms of Service and Privacy Policy. 
                  The referral code must be valid and unused.
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 