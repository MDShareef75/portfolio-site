'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, SparklesIcon, GiftIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/solid';

interface ReferralPopupProps {
  onReferNow: () => void;
  onClientLogin: () => void;
}

export default function ReferralPopup({ onReferNow, onClientLogin }: ReferralPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [animatedNumbers, setAnimatedNumbers] = useState({ reward: 0, discount: 0, maxEarning: 0 });

  useEffect(() => {
    // Show popup after 3 seconds unless user has seen it recently
    const hasSeenPopup = localStorage.getItem('atoms_referral_popup_seen');
    const lastSeen = hasSeenPopup ? parseInt(hasSeenPopup) : 0;
    const now = new Date().getTime(); // More consistent than Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (!hasSeenPopup || (now - lastSeen) > oneDayMs) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        animateNumbers();
      }, 3000);
      
      // Listen for custom event to show popup manually
      const handleShowPopup = () => {
        setIsVisible(true);
        animateNumbers();
      };
      
      window.addEventListener('showReferralPopup', handleShowPopup);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('showReferralPopup', handleShowPopup);
      };
    } else {
      // Still listen for manual trigger even if auto-popup is disabled
      const handleShowPopup = () => {
        setIsVisible(true);
        animateNumbers();
      };
      
      window.addEventListener('showReferralPopup', handleShowPopup);
      
      return () => {
        window.removeEventListener('showReferralPopup', handleShowPopup);
      };
    }
  }, []);

  const animateNumbers = () => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const interval = setInterval(() => {
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedNumbers({
        reward: step === steps - 1 ? 500 : Math.floor(500 * easeOut),
        discount: step === steps - 1 ? 25 : Math.floor(25 * easeOut),
        maxEarning: step === steps - 1 ? 5000 : Math.floor(5000 * easeOut),
      });

      if (++step >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('atoms_referral_popup_seen', new Date().getTime().toString());
  };

  const handleReferNow = () => {
    handleClose();
    onReferNow();
  };

  const handleClientLogin = () => {
    handleClose();
    onClientLogin();
  };

  if (!isVisible) return null;

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
          className="relative max-w-lg w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/circuit-pattern.svg')] opacity-30 animate-pulse"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>

          {/* Content */}
          <div className="relative p-6 md:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4"
              >
                <GiftIcon className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-2xl md:text-3xl font-bold text-white mb-2"
              >
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Refer & Earn up to 
                </span>
                <motion.span
                  key={animatedNumbers.maxEarning}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-yellow-400 ml-2"
                >
                  ₹{animatedNumbers.maxEarning.toLocaleString()}!
                </motion.span>
              </motion.h2>
            </div>

            {/* Features Grid */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mb-6"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-cyan-500/20">
                <div className="flex items-center mb-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-cyan-400 font-semibold text-sm">Per Referral</span>
                </div>
                <motion.div
                  key={animatedNumbers.reward}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-white"
                >
                  ₹{animatedNumbers.reward}
                </motion.div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center mb-2">
                  <SparklesIcon className="w-5 h-5 text-purple-400 mr-2" />
                  <span className="text-purple-400 font-semibold text-sm">Friend's Discount</span>
                </div>
                <motion.div
                  key={animatedNumbers.discount}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-white"
                >
                  {animatedNumbers.discount}% OFF
                </motion.div>
              </div>
            </motion.div>

            {/* Offer Details */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 mb-6 border border-yellow-500/30"
            >
              <div className="flex items-center text-yellow-300 mb-2">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span className="font-semibold">Limited Time Offer!</span>
              </div>
              <p className="text-white text-sm">
                Valid: <span className="font-bold">1st–15th August 2025</span> • 
                Max: <span className="font-bold">10 referrals per user</span>
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReferNow}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
              >
                🚀 Refer Now & Start Earning!
              </motion.button>

              <motion.a
                href="/client-portal/signup"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25 text-center"
              >
                👤 I'm a Client
              </motion.a>
            </motion.div>

            {/* Terms Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-4"
            >
              <button
                onClick={() => setShowTerms(true)}
                className="text-cyan-400 hover:text-cyan-300 text-sm underline"
              >
                📜 Terms & Conditions Apply
              </button>
            </motion.div>
          </div>

          {/* Floating Elements */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-6 left-6 w-3 h-3 bg-cyan-400 rounded-full blur-sm"
          />
          <motion.div
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute bottom-8 right-8 w-2 h-2 bg-purple-400 rounded-full blur-sm"
          />
        </motion.div>

        {/* Terms & Conditions Modal */}
        <AnimatePresence>
          {showTerms && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex items-center justify-center p-4"
              onClick={() => setShowTerms(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto border border-cyan-500/30"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Terms & Conditions</h3>
                  <button
                    onClick={() => setShowTerms(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-gray-300 text-sm space-y-3">
                  <p>✅ One account per user (email & phone verified)</p>
                  <p>✅ Maximum 10 referral codes per user</p>
                  <p>✅ ₹500 reward only after referred client pays 1/3rd of discounted price</p>
                  <p>✅ Referral code valid for one client signup only</p>
                  <p>✅ Offer valid from 1–15 August 2025</p>
                  <p>✅ Atoms Innovation reserves right to disqualify fraudulent activity</p>
                  <p>✅ Rewards will be transferred via UPI within 48 hours</p>
                  <p>✅ Cannot refer yourself or use your own referral code</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
} 