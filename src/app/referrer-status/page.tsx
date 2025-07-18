'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  EyeIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';

interface ReferrerData {
  email: string;
  phone: string;
  upi: string;
  referralCodes: string[];
  totalRewards: number;
  usedCodes: number;
  eligibleRewards: number;
  paidRewards: number;
  recentActivity: Array<{
    code: string;
    clientName?: string;
    status: 'used' | 'paid' | 'pending' | 'eligible';
    bonusStatus?: string;
    date: string;
  }>;
}

export default function ReferrerStatus() {
  const [searchData, setSearchData] = useState({ email: '', password: '' });
  const [referrerData, setReferrerData] = useState<ReferrerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('referrer_auth');
    console.log('Checking saved auth on referrer status page:', savedAuth);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        console.log('Parsed auth data:', authData);
        if (authData.email && authData.password) {
          setSearchData({ email: authData.email, password: authData.password });
          // Auto-login with saved credentials
          setTimeout(() => {
            handleAutoLogin(authData.email, authData.password);
          }, 500);
        }
      } catch (error) {
        console.error('Error parsing saved auth:', error);
        localStorage.removeItem('referrer_auth'); // Clear corrupted data
      }
    }
  }, []);

  const handleAutoLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/getReferrerStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password: password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle rate limiting specifically
        if (response.status === 429) {
          setError('Rate limit exceeded. Please wait a moment before trying again.');
          // Clear auth data if rate limited to prevent auto-retry
          localStorage.removeItem('referrer_auth');
        } else {
          throw new Error(result.error || 'Failed to fetch referrer data');
        }
        return;
      }

      if (result.success) {
        setReferrerData(result.referrer);
        setIsAuthenticated(true);
        // Update stored auth data
        localStorage.setItem('referrer_auth', JSON.stringify({ email, password }));
        console.log('✅ Auto-login successful for referrer status page');
      } else {
        throw new Error('Failed to fetch referrer data');
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch referrer data. Please try again.');
      // Clear auth data on error to prevent infinite retry
      localStorage.removeItem('referrer_auth');
    }

    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchData.email || !searchData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/getReferrerStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: searchData.email.toLowerCase(),
          password: searchData.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch referrer data');
      }

      if (result.success) {
        setReferrerData(result.referrer);
        setIsAuthenticated(true);
        // Store auth data for seamless navigation and session persistence
        localStorage.setItem('referrer_auth', JSON.stringify({
          email: searchData.email,
          password: searchData.password
        }));
        console.log('✅ Manual login successful, session stored');
      } else {
        throw new Error('Failed to fetch referrer data');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch referrer data. Please try again.');
    }

    setLoading(false);
  };

  const handleRefresh = () => {
    if (isAuthenticated && searchData.email && searchData.password) {
      handleAutoLogin(searchData.email, searchData.password);
    }
  };

  const handleReset = () => {
    setSearchData({ email: '', password: '' });
    setReferrerData(null);
    setIsAuthenticated(false);
    setError('');
    // Clear stored auth data
    localStorage.removeItem('referrer_auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Referral Status</h1>
            <p className="text-gray-300">Enter your details to view your referral performance</p>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-4" suppressHydrationWarning>
            <div>
              <label className="block text-cyan-400 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={searchData.email}
                  onChange={(e) => setSearchData(prev => ({ ...prev, email: e.target.value }))}
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  placeholder="your@email.com"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            <div>
              <label className="block text-cyan-400 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  value={searchData.password}
                  onChange={(e) => setSearchData(prev => ({ ...prev, password: e.target.value }))}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-3 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter your password"
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 flex items-center"
              >
                <ExclamationCircleIcon className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
              } text-white`}
              suppressHydrationWarning
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Checking Status...
                </div>
              ) : (
                <>
                  <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                  Check My Status
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Don't have a referral code yet?
            </p>
            <Link
              href="/#referral"
              className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
            >
              Generate First Referral Code
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Referral Dashboard</h1>
              <p className="text-gray-300">Welcome back, {referrerData?.email}</p>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleRefresh}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                    />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleReset}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Codes</p>
                <p className="text-2xl font-bold">{referrerData?.referralCodes.length}</p>
              </div>
              <TicketIcon className="w-10 h-10 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Used Codes</p>
                <p className="text-2xl font-bold">{referrerData?.usedCodes}</p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Eligible Rewards</p>
                <p className="text-2xl font-bold">{referrerData?.eligibleRewards}</p>
              </div>
              <ClockIcon className="w-10 h-10 text-white/80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Earned</p>
                <p className="text-2xl font-bold">₹{(referrerData?.totalRewards || 0) * 500}</p>
              </div>
              <CurrencyRupeeIcon className="w-10 h-10 text-white/80" />
            </div>
          </div>
        </motion.div>

        {/* Referral Codes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Your Referral Codes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {referrerData?.referralCodes.map((code, index) => {
              const activity = referrerData.recentActivity.find(a => a.code === code);
              return (
                <motion.div
                  key={code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white/5 rounded-lg p-4 border border-cyan-500/20"
                >
                  <div className="text-center">
                    <h3 className="text-cyan-400 font-mono text-lg font-bold mb-2">{code}</h3>
                    <div className="flex items-center justify-center mb-2">
                      {activity?.status === 'paid' ? (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Paid
                        </span>
                      ) : activity?.status === 'eligible' ? (
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Eligible
                        </span>
                      ) : activity?.status === 'pending' ? (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      ) : activity?.status === 'used' ? (
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                          Used
                        </span>
                      ) : (
                        <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs font-semibold">
                          Available
                        </span>
                      )}
                    </div>
                    {activity?.clientName && (
                      <p className="text-gray-300 text-xs">by {activity.clientName}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {referrerData?.recentActivity.map((activity, index) => (
              <motion.div
                key={`${activity.code}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <h4 className="text-white font-semibold font-mono">{activity.code}</h4>
                  {activity.clientName ? (
                    <p className="text-gray-300 text-sm">Client: {activity.clientName}</p>
                  ) : (
                    <p className="text-gray-300 text-sm">Code used</p>
                  )}
                  <p className="text-gray-400 text-xs">{activity.date}</p>
                </div>
                <div className="text-right">
                  {activity.status === 'paid' ? (
                    <div>
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                        ✅ Paid
                      </span>
                      <p className="text-green-400 text-sm font-bold mt-1">+₹500</p>
                    </div>
                  ) : activity.status === 'eligible' ? (
                    <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold">
                      🎯 Eligible
                    </span>
                  ) : activity.status === 'pending' ? (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
                      ⏳ Pending
                    </span>
                  ) : (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
                      👤 Used
                    </span>
                  )}
                  {activity.bonusStatus && activity.bonusStatus !== 'Pending' && (
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activity.bonusStatus === 'Paid' ? 'bg-green-500/20 text-green-400' :
                        activity.bonusStatus === 'Eligible' ? 'bg-orange-500/20 text-orange-400' :
                        activity.bonusStatus === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                        activity.bonusStatus === 'Rejected' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {activity.bonusStatus}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Earnings Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">💰 Your Earnings</h3>
              <p className="text-gray-300 text-sm">
                UPI ID: <span className="font-mono text-cyan-400">{referrerData?.upi}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-400">₹{(referrerData?.totalRewards || 0) * 500}</p>
              <p className="text-gray-400 text-sm">Total earned</p>
            </div>
          </div>
          
          {(referrerData?.eligibleRewards || 0) > 0 && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">
                🕒 You have <span className="font-bold">₹{(referrerData?.eligibleRewards || 0) * 500}</span> eligible rewards.
                They are awaiting admin approval for payment.
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/referrer-generate"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 text-center"
          >
            🎁 Generate More Codes
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-300 text-center"
          >
            💬 Contact Support
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 