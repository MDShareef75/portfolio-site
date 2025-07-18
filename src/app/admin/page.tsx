'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChartBarIcon,
  UsersIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  GiftIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FolderIcon,
  CreditCardIcon,
  CalendarIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

interface DashboardStats {
  totalReferrers: number;
  totalClients: number;
  totalCodes: number;
  usedCodes: number;
  eligibleRewards: number;
  paidRewards: number;
  totalEarnings: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
}

interface Referrer {
  id: string;
  email: string;
  phone: string;
  upi?: string;
  referralCodes: string[];
  referralCodesWithStatus?: Array<{
    code: string;
    used: boolean;
    rewardPaid: boolean;
    rewardEligibleAt?: any;
    bonusStatus?: string;
    bonusUpdatedAt?: any;
    paidAt?: any;
  }>;
  totalRewards: number;
  createdAt: any;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  discount: number;
  paymentStatus: string;
  projectStatus: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount?: number;
  dueDate?: string;
  lastPaymentDate?: string;
  paymentMethod?: string;
  active: boolean;
  createdAt: any;
}

interface Project {
  id: string;
  name: string;
  description: string;
  clientEmail: string;
  clientName: string;
  status: string;
  priority: string;
  technology: string[];
  budget: number;
  startDate: string;
  dueDate: string;
  progress: number;
  assignedTo: string;
  createdAt: any;
  updatedAt: any;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'referrers' | 'clients' | 'projects' | 'payments' | 'payment-verification'>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingReferrer, setEditingReferrer] = useState<Referrer | null>(null);
  const [viewingReferrer, setViewingReferrer] = useState<Referrer | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Check for existing authentication session on component mount
  useEffect(() => {
    const checkAuthSession = () => {
      try {
        const authData = localStorage.getItem('atoms_admin_auth');
        if (authData) {
          const { isAuthenticated, timestamp } = JSON.parse(authData);
          const now = Date.now();
          const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
          
          // Check if session is still valid (less than 8 hours old)
          if (isAuthenticated && (now - timestamp) < sessionDuration) {
            setIsAuthenticated(true);
            fetchDashboardData();
          } else {
            // Session expired, clear it
            clearAuthSession();
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        clearAuthSession();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthSession();
  }, []);

  // Periodic session check (every 5 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    const sessionCheckInterval = setInterval(() => {
      try {
        const authData = localStorage.getItem('atoms_admin_auth');
        if (authData) {
          const { timestamp } = JSON.parse(authData);
          const now = Date.now();
          const sessionDuration = 8 * 60 * 60 * 1000; // 8 hours
          const timeLeft = sessionDuration - (now - timestamp);
          
          // If session expired, logout
          if (timeLeft <= 0) {
            alert('Your session has expired. Please login again.');
            handleLogout();
          }
          // Warn if less than 30 minutes left
          else if (timeLeft <= 30 * 60 * 1000 && timeLeft > 25 * 60 * 1000) {
            const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
            if (confirm(`Your session will expire in ${minutesLeft} minutes. Would you like to extend it?`)) {
              extendSession();
            }
          }
        } else {
          // No auth data found, logout
          handleLogout();
        }
      } catch (error) {
        console.error('Error in session check:', error);
        handleLogout();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  // Store authentication session
  const storeAuthSession = () => {
    try {
      const authData = {
        isAuthenticated: true,
        timestamp: Date.now()
      };
      localStorage.setItem('atoms_admin_auth', JSON.stringify(authData));
    } catch (error) {
      console.error('Error storing auth session:', error);
    }
  };

  // Clear authentication session
  const clearAuthSession = () => {
    try {
      localStorage.removeItem('atoms_admin_auth');
    } catch (error) {
      console.error('Error clearing auth session:', error);
    }
  };

  // Extend session when user is active
  const extendSession = () => {
    if (isAuthenticated) {
      storeAuthSession();
    }
  };

  // Show toast notification
  const showToast = (type: 'success' | 'error', message: string) => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 5000); // Hide after 5 seconds
  };

  // Authentication
  const handleLogin = async () => {
    if (adminKey === 'ATOMS_ADMIN_2025' && 
        adminEmail === 'admin@atomsintelligence.in' && 
        adminPassword === 'AdminAtoms2025') {
      setIsAuthenticated(true);
      storeAuthSession(); // Store session in localStorage
      await fetchDashboardData();
    } else {
      alert('Invalid admin credentials');
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    clearAuthSession(); // Clear session from localStorage
    setStats(null);
    setReferrers([]);
    setClients([]);
    setAdminKey('');
    setAdminEmail('');
    setAdminPassword('');
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    console.log('🔄 Admin refresh button clicked!');
    setLoading(true);
    setRefreshSuccess(false);
    extendSession(); // Extend session on activity
    try {
      console.log('Making API request to admin dashboard...');
      const response = await fetch(`https://us-central1-atoms-portfolio.cloudfunctions.net/adminDashboard?adminKey=ATOMS_ADMIN_2025`);
      const data = await response.json();
      console.log('Admin dashboard response:', data);
      
      if (data.success) {
        setStats(data.stats);
        setReferrers(data.recentReferrers || []);
        setClients(data.recentClients || []);
        setProjects(data.recentProjects || []);
        
        // Show success feedback
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 2000); // Hide after 2 seconds
        console.log('✅ Admin dashboard refreshed successfully');
      } else {
        console.error('API returned error:', data.error);
        showToast('error', 'API Error: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      showToast('error', 'Network Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    setLoading(false);
  };

  // Verify payment
  const verifyPayment = async (paymentId: string, approved: boolean, adminNotes?: string) => {
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/verifyPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          adminKey: 'ATOMS_ADMIN_2025',
          approved,
          adminNotes: adminNotes || ''
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast('success', `Payment ${approved ? 'approved' : 'rejected'} successfully!`);
        await fetchDashboardData(); // Refresh data
      } else {
        showToast('error', data.error || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      showToast('error', 'Error verifying payment');
    }
  };

  // Update payment status
  const updatePaymentStatus = async (clientEmail: string, updates: any) => {
    extendSession(); // Extend session on activity
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/updatePaymentStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail,
          adminKey: 'ATOMS_ADMIN_2025',
          ...updates
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchDashboardData(); // Refresh data
        if (data.rewardTriggered) {
          alert('Payment updated and reward triggered!');
        }
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  // Update client status (active/inactive)
  const updateClientStatus = async (clientEmail: string, active: boolean) => {
    extendSession(); // Extend session on activity
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/updateClientStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail,
          active,
          adminKey: 'ATOMS_ADMIN_2025'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        const updatedClients = clients.map(client => 
          client.email === clientEmail 
            ? { ...client, active: active }
            : client
        );
        setClients(updatedClients);
        
        // Refresh dashboard data
        await fetchDashboardData();
        alert(`Client ${active ? 'activated' : 'deactivated'} successfully!`);
      } else {
        alert('Failed to update client status');
      }
    } catch (error) {
      console.error('Error updating client status:', error);
      alert('Error updating client status');
    }
  };

  // Update referrer information
  const updateReferrerInfo = async (referrerEmail: string, updates: any) => {
    extendSession(); // Extend session on activity
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/updateReferrerInfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referrerEmail,
          phone: updates.phone,
          upi: updates.upi,
          adminKey: 'ATOMS_ADMIN_2025'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        const updatedReferrers = referrers.map(referrer => 
          referrer.email === referrerEmail 
            ? { ...referrer, ...updates }
            : referrer
        );
        setReferrers(updatedReferrers);
        
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        alert('Failed to update referrer information');
      }
    } catch (error) {
      console.error('Error updating referrer:', error);
      alert('Error updating referrer information');
    }
  };

  // Update referral bonus status
  const updateReferralBonusStatus = async (referralCode: string, bonusStatus: string) => {
    extendSession(); // Extend session on activity
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/updateReferralBonusStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referralCode,
          bonusStatus,
          adminKey: 'ATOMS_ADMIN_2025'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state immediately for better UX
        const updatedReferrers = referrers.map(referrer => {
          if (referrer.referralCodesWithStatus) {
            const updatedCodes = referrer.referralCodesWithStatus.map(codeData => {
              if (codeData.code === referralCode) {
                return { ...codeData, bonusStatus };
              }
              return codeData;
            });
            return { ...referrer, referralCodesWithStatus: updatedCodes };
          }
          return referrer;
        });
        setReferrers(updatedReferrers);
        
        // Refresh dashboard data in background
        fetchDashboardData();
      } else {
        console.error('Failed to update bonus status:', data.error);
      }
    } catch (error) {
      console.error('Error updating bonus status:', error);
    }
  };

  // Create or update project
  const saveProject = async (projectData: any) => {
    extendSession(); // Extend session on activity
    try {
      const endpoint = editingProject 
        ? 'https://us-central1-atoms-portfolio.cloudfunctions.net/updateProject'
        : 'https://us-central1-atoms-portfolio.cloudfunctions.net/createProject';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectData,
          projectId: editingProject?.id,
          adminKey: 'ATOMS_ADMIN_2025'
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchDashboardData(); // Refresh all data
        setEditingProject(null);
        setShowCreateProject(false);
        showToast('success', editingProject ? 'Project updated successfully!' : 'Project created successfully!');
      } else {
        showToast('error', data.error || 'Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
      showToast('error', 'Error saving project');
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    extendSession(); // Extend session on activity
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/deleteProject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          adminKey: 'ATOMS_ADMIN_2025'
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchDashboardData(); // Refresh all data
        showToast('success', 'Project deleted successfully!');
      } else {
        showToast('error', data.error || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('error', 'Error deleting project');
    }
  };

  // Filter data based on search
  const filteredReferrers = referrers.filter(referrer =>
    referrer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referrer.phone.includes(searchTerm)
  );

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.technology.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
  );



  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-white text-lg">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mb-4">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Enter admin credentials to access</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Enter admin email"
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Access Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Referral System Admin</h1>
              <p className="text-gray-300">Manage referrers, clients, and track rewards</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleLogout}
              className="mt-4 md:mt-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { id: 'referrers', label: 'Referrers', icon: UsersIcon },
              { id: 'clients', label: 'Clients', icon: UserGroupIcon },
              { id: 'payments', label: 'Payments', icon: CreditCardIcon },
              { id: 'payment-verification', label: 'Payment Verification', icon: CheckCircleIcon },
              { id: 'projects', label: 'Projects', icon: FolderIcon },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { label: 'Total Referrers', value: stats.totalReferrers, icon: UsersIcon, color: 'from-blue-500 to-cyan-500' },
                { label: 'Total Clients', value: stats.totalClients, icon: UserGroupIcon, color: 'from-purple-500 to-indigo-500' },
                { label: 'Total Projects', value: stats.totalProjects || 0, icon: FolderIcon, color: 'from-indigo-500 to-purple-500' },
                { label: 'Rewards Paid', value: stats.paidRewards, icon: GiftIcon, color: 'from-green-500 to-emerald-500' },
                { label: 'Client Payments', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: CurrencyRupeeIcon, color: 'from-yellow-500 to-orange-500' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`bg-gradient-to-r ${stat.color} p-6 rounded-2xl text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="w-10 h-10 text-white/80" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white font-semibold mb-4">Code Usage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Codes</span>
                    <span className="text-white font-semibold">{stats.totalCodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Used Codes</span>
                    <span className="text-green-400 font-semibold">{stats.usedCodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Available</span>
                    <span className="text-cyan-400 font-semibold">{stats.totalCodes - stats.usedCodes}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-white font-semibold mb-4">Rewards Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Eligible</span>
                    <span className="text-yellow-400 font-semibold">{stats.eligibleRewards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Paid</span>
                    <span className="text-green-400 font-semibold">{stats.paidRewards}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Pending</span>
                    <span className="text-orange-400 font-semibold">{stats.eligibleRewards - stats.paidRewards}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/30">
                <h3 className="text-white font-semibold mb-4">Project Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Active</span>
                    <span className="text-blue-400 font-semibold">{stats.activeProjects || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Completed</span>
                    <span className="text-green-400 font-semibold">{stats.completedProjects || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total</span>
                    <span className="text-indigo-400 font-semibold">{stats.totalProjects || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
                <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fetchDashboardData()}
                    disabled={loading}
                    className={`w-full flex items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                      loading 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : refreshSuccess 
                        ? 'bg-green-500' 
                        : 'bg-cyan-500 hover:bg-cyan-600'
                    } text-white`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Refreshing...
                      </>
                    ) : refreshSuccess ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
                        Updated!
                      </>
                    ) : (
                      <>
                        <ArrowUpIcon className="w-4 h-4 mr-2 transform rotate-45" />
                        Refresh Data
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveTab('projects')}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Manage Projects
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Referrers Tab */}
        {activeTab === 'referrers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search referrers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Referrers Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 overflow-hidden">
              <div className="p-6 border-b border-gray-600 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Referrers Management</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : refreshSuccess 
                      ? 'bg-green-500' 
                      : 'bg-cyan-500 hover:bg-cyan-600'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Refreshing...
                    </>
                  ) : refreshSuccess ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <ArrowUpIcon className="w-4 h-4 mr-2 transform rotate-45" />
                      Refresh
                    </>
                  )}
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Phone</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Codes</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Rewards</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Bonus Status</th>
                      <th className="px-6 py-4 text-left text-cyan-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mr-3"></div>
                            <span className="text-gray-400">Loading referrers...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredReferrers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center">
                          <div className="text-gray-400">
                            {searchTerm ? 'No referrers found matching your search.' : 'No referrers found. Generate some referral codes to see them here.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredReferrers.map((referrer, index) => (
                        <motion.tr
                          key={referrer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700 hover:bg-white/5"
                        >
                                                  <td className="px-6 py-4 text-white">{referrer.email}</td>
                        <td className="px-6 py-4 text-gray-300">{referrer.phone}</td>
                        <td className="px-6 py-4 text-cyan-400">{referrer.referralCodes?.length || 0}</td>
                        <td className="px-6 py-4 text-green-400">{referrer.totalRewards || 0}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {referrer.referralCodesWithStatus ? (
                              referrer.referralCodesWithStatus.map((codeData, index) => (
                                <div key={codeData.code} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                                  <div className="flex-1">
                                    <div className="text-xs text-cyan-400 font-mono">{codeData.code}</div>
                                    <div className="text-xs text-gray-400">
                                      {codeData.used ? 'Used' : 'Unused'} • 
                                      {codeData.bonusStatus ? ` ${codeData.bonusStatus}` : ' Pending'}
                                    </div>
                                  </div>
                                  {codeData.used && (
                                    <select
                                      value={codeData.bonusStatus || 'Pending'}
                                      onChange={(e) => updateReferralBonusStatus(codeData.code, e.target.value)}
                                      className="text-xs bg-slate-800 border border-gray-600 rounded px-2 py-1 text-white focus:outline-none focus:border-cyan-500"
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Eligible">Eligible</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Paid">Paid</option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
                                  )}
                                </div>
                              ))
                            ) : (
                              // Fallback for old data structure
                              referrer.referralCodes?.map((code, index) => (
                                <div key={code} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                                  <div className="flex-1">
                                    <div className="text-xs text-cyan-400 font-mono">{code}</div>
                                    <div className="text-xs text-gray-400">Status: Unknown</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setViewingReferrer(referrer)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setEditingReferrer(referrer)}
                              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Clients Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 overflow-hidden">
              <div className="p-6 border-b border-gray-600 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Clients Management</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : refreshSuccess 
                      ? 'bg-green-500' 
                      : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Refreshing...
                    </>
                  ) : refreshSuccess ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <ArrowUpIcon className="w-4 h-4 mr-2 transform rotate-45" />
                      Refresh
                    </>
                  )}
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Name</th>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Code</th>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Payment</th>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Project</th>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Active</th>
                      <th className="px-6 py-4 text-left text-purple-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mr-3"></div>
                            <span className="text-gray-400">Loading clients...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="text-gray-400">
                            {searchTerm ? 'No clients found matching your search.' : 'No clients found. Create some clients to see them here.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client, index) => (
                        <motion.tr
                          key={client.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-700 hover:bg-white/5"
                        >
                          <td className="px-6 py-4 text-white">{client.name}</td>
                          <td className="px-6 py-4 text-gray-300">{client.email}</td>
                          <td className="px-6 py-4 text-cyan-400 font-mono">{client.referralCode}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.paymentStatus === 'Paid Step 1' ? 'bg-green-500/20 text-green-400' :
                              client.paymentStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {client.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              client.projectStatus === 'Completed' ? 'bg-green-500/20 text-green-400' :
                              client.projectStatus === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {client.projectStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateClientStatus(client.email, !client.active)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                client.active 
                                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              }`}
                            >
                              {client.active ? '✅ Active' : '❌ Inactive'}
                            </motion.button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setEditingClient(client)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-2xl text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Total Collected</p>
                    <p className="text-2xl font-bold">₹{clients.reduce((sum, client) => sum + (client.paidAmount || 0), 0).toLocaleString()}</p>
                  </div>
                  <BanknotesIcon className="w-10 h-10 text-white/80" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-2xl text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Total Pending</p>
                    <p className="text-2xl font-bold">₹{clients.reduce((sum, client) => sum + ((client.totalAmount || 0) - (client.paidAmount || 0)), 0).toLocaleString()}</p>
                  </div>
                  <ClockIcon className="w-10 h-10 text-white/80" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-2xl text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Overdue Payments</p>
                    <p className="text-2xl font-bold">
                      {clients.filter(client => {
                        if (!client.dueDate) return false;
                        const dueDate = new Date(client.dueDate);
                        const today = new Date();
                        return dueDate < today && (client.totalAmount || 0) > (client.paidAmount || 0);
                      }).length}
                    </p>
                  </div>
                  <CalendarIcon className="w-10 h-10 text-white/80" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-2xl text-white"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {clients.length > 0 ? 
                        Math.round((clients.filter(c => (c.paidAmount || 0) >= (c.totalAmount || 0)).length / clients.length) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <CheckCircleIcon className="w-10 h-10 text-white/80" />
                </div>
              </motion.div>
            </div>

            {/* Payment Management Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-green-500/30 overflow-hidden">
              <div className="p-6 border-b border-gray-600 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Payment Management</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : refreshSuccess 
                      ? 'bg-green-500' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Refreshing...
                    </>
                  ) : refreshSuccess ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <ArrowUpIcon className="w-4 h-4 mr-2 transform rotate-45" />
                      Refresh
                    </>
                  )}
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Client</th>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Total Amount</th>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Paid Amount</th>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Pending</th>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Due Date</th>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-green-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-3"></div>
                            <span className="text-gray-400">Loading payment data...</span>
                          </div>
                        </td>
                      </tr>
                    ) : clients.filter(client => 
                      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      client.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center">
                          <div className="text-gray-400">
                            {searchTerm ? 'No payments found matching your search.' : 'No payment records found.'}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      clients
                        .filter(client => 
                          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          client.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                                                 .map((client, index) => {
                           const totalAmount = client.totalAmount || 0;
                           const paidAmount = client.paidAmount || 0;
                           const pendingAmount = totalAmount - paidAmount;
                           const isOverdue = client.dueDate && new Date(client.dueDate) < new Date() && pendingAmount > 0;
                           const isFullyPaid = totalAmount > 0 && paidAmount >= totalAmount;
                          
                          return (
                            <motion.tr
                              key={client.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`border-b border-gray-700 hover:bg-white/5 ${
                                isOverdue ? 'bg-red-500/10' : ''
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-white font-medium">{client.name}</div>
                                  <div className="text-gray-400 text-sm">{client.email}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-300 font-semibold">
                                ₹{(client.totalAmount || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-green-400 font-semibold">
                                ₹{(client.paidAmount || 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-semibold ${
                                  pendingAmount > 0 ? 'text-yellow-400' : 'text-green-400'
                                }`}>
                                  ₹{pendingAmount.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {client.dueDate ? (
                                  <span className={`text-sm ${
                                    isOverdue ? 'text-red-400 font-semibold' : 'text-gray-300'
                                  }`}>
                                    {new Date(client.dueDate).toLocaleDateString()}
                                    {isOverdue && ' (Overdue)'}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-sm">Not set</span>
                                )}
                              </td>
                                                             <td className="px-6 py-4">
                                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                   isFullyPaid
                                     ? 'bg-green-500/20 text-green-400'
                                     : isOverdue
                                     ? 'bg-red-500/20 text-red-400'
                                     : totalAmount > 0 && paidAmount > 0
                                     ? 'bg-yellow-500/20 text-yellow-400'
                                     : paidAmount > 0
                                     ? 'bg-blue-500/20 text-blue-400'
                                     : totalAmount > 0
                                     ? 'bg-orange-500/20 text-orange-400'
                                     : 'bg-gray-500/20 text-gray-400'
                                 }`}>
                                   {isFullyPaid
                                     ? 'Paid in Full'
                                     : isOverdue
                                     ? 'Overdue'
                                     : totalAmount > 0 && paidAmount > 0
                                     ? 'Partial Payment'
                                     : paidAmount > 0
                                     ? 'Payment without Quote'
                                     : totalAmount > 0
                                     ? 'Quote Sent'
                                     : 'No Quote Set'}
                                 </span>
                               </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditingClient(client)}
                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    title="Edit Payment"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setViewingClient(client)}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                    title="View Payment History"
                                  >
                                    <EyeIcon className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        }))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar and Create Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowCreateProject(true)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300 flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Project
              </motion.button>
            </div>

            {/* Projects Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-indigo-500/30 overflow-hidden">
              <div className="p-6 border-b border-gray-600 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Projects Management</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fetchDashboardData()}
                  disabled={loading}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    loading 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : refreshSuccess 
                      ? 'bg-green-500' 
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  } text-white`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Refreshing...
                    </>
                  ) : refreshSuccess ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" />
                      Updated!
                    </>
                  ) : (
                    <>
                      <ArrowUpIcon className="w-4 h-4 mr-2 transform rotate-45" />
                      Refresh
                    </>
                  )}
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Project</th>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Client</th>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Priority</th>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Progress</th>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Budget</th>
                      <th className="px-6 py-4 text-left text-indigo-400 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project, index) => (
                      <motion.tr
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-700 hover:bg-white/5"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-white font-medium">{project.name}</div>
                            <div className="text-gray-400 text-sm">{project.technology.join(', ')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{project.clientName}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            project.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                            project.status === 'Testing' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            project.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                            project.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-indigo-400 text-sm font-medium">{project.progress}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-green-400">₹{project.budget.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setViewingProject(project)}
                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setEditingProject(project)}
                              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              onClick={() => deleteProject(project.id)}
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Edit Client Modal */}
        {editingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingClient(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-purple-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Update Client</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updates = {
                  totalAmount: Number(formData.get('totalAmount')),
                  paidAmount: Number(formData.get('paidAmount')),
                  paymentStatus: formData.get('paymentStatus'),
                  projectStatus: formData.get('projectStatus'),
                  active: formData.get('active') === 'true',
                };
                updatePaymentStatus(editingClient.email, updates);
                setEditingClient(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">Total Amount</label>
                  <input
                    name="totalAmount"
                    type="number"
                    defaultValue={editingClient.totalAmount}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">Paid Amount</label>
                  <input
                    name="paidAmount"
                    type="number"
                    defaultValue={editingClient.paidAmount}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">Payment Status</label>
                  <select
                    name="paymentStatus"
                    defaultValue={editingClient.paymentStatus}
                    className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="Pending" className="bg-slate-800 text-white">Pending</option>
                    <option value="Paid Step 1" className="bg-slate-800 text-white">Paid Step 1</option>
                    <option value="Partially Paid" className="bg-slate-800 text-white">Partially Paid</option>
                    <option value="Fully Paid" className="bg-slate-800 text-white">Fully Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">Project Status</label>
                  <select
                    name="projectStatus"
                    defaultValue={editingClient.projectStatus}
                    className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="Not Started" className="bg-slate-800 text-white">Not Started</option>
                    <option value="In Progress" className="bg-slate-800 text-white">In Progress</option>
                    <option value="Testing" className="bg-slate-800 text-white">Testing</option>
                    <option value="Completed" className="bg-slate-800 text-white">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">Client Status</label>
                  <select
                    name="active"
                    defaultValue={editingClient.active ? 'true' : 'false'}
                    className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="true" className="bg-slate-800 text-white">Active</option>
                    <option value="false" className="bg-slate-800 text-white">Inactive</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Update
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={() => setEditingClient(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* View Referrer Modal */}
        {viewingReferrer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewingReferrer(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-lg border border-blue-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Referrer Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Email</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingReferrer.email}</p>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Phone</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingReferrer.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-blue-400 text-sm font-semibold mb-1">UPI ID</label>
                  <p className="text-white bg-white/10 px-3 py-2 rounded-lg font-mono">{viewingReferrer.upi}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Total Codes</label>
                    <p className="text-cyan-400 text-2xl font-bold">{viewingReferrer.referralCodes?.length || 0}</p>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Total Rewards</label>
                    <p className="text-green-400 text-2xl font-bold">₹{(viewingReferrer.totalRewards || 0) * 500}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-blue-400 text-sm font-semibold mb-2">Referral Codes</label>
                  <div className="bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {viewingReferrer.referralCodes && viewingReferrer.referralCodes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {viewingReferrer.referralCodes.map((code, index) => (
                          <span key={index} className="text-cyan-400 font-mono text-sm bg-cyan-500/20 px-2 py-1 rounded">
                            {code}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No referral codes generated yet</p>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setViewingReferrer(null)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Create/Edit Project Modal */}
        {(showCreateProject || editingProject) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowCreateProject(false);
              setEditingProject(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-indigo-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const projectData = {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  clientEmail: formData.get('clientEmail'),
                  status: formData.get('status'),
                  priority: formData.get('priority'),
                  technology: (formData.get('technology') as string).split(',').map(t => t.trim()),
                  budget: Number(formData.get('budget')),
                  startDate: formData.get('startDate'),
                  dueDate: formData.get('dueDate'),
                  progress: Number(formData.get('progress')),
                  assignedTo: formData.get('assignedTo'),
                };
                saveProject(projectData);
              }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Project Name *</label>
                    <input
                      name="name"
                      type="text"
                      defaultValue={editingProject?.name}
                      required
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Client *</label>
                    <select
                      name="clientEmail"
                      defaultValue={editingProject?.clientEmail}
                      required
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.email} value={client.email}>
                          {client.name} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-400 text-sm font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProject?.description}
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Status</label>
                    <select
                      name="status"
                      defaultValue={editingProject?.status || 'Not Started'}
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Testing">Testing</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Priority</label>
                    <select
                      name="priority"
                      defaultValue={editingProject?.priority || 'Medium'}
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Progress (%)</label>
                    <input
                      name="progress"
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={editingProject?.progress || 0}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-400 text-sm font-semibold mb-2">Technology Stack</label>
                  <input
                    name="technology"
                    type="text"
                    defaultValue={editingProject?.technology?.join(', ')}
                    placeholder="React, Node.js, MongoDB (comma separated)"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Budget (₹)</label>
                    <input
                      name="budget"
                      type="number"
                      defaultValue={editingProject?.budget}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Start Date</label>
                    <input
                      name="startDate"
                      type="date"
                      defaultValue={editingProject?.startDate}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-indigo-400 text-sm font-semibold mb-2">Due Date</label>
                    <input
                      name="dueDate"
                      type="date"
                      defaultValue={editingProject?.dueDate}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-indigo-400 text-sm font-semibold mb-2">Assigned To</label>
                  <input
                    name="assignedTo"
                    type="text"
                    defaultValue={editingProject?.assignedTo}
                    placeholder="Developer/Team name"
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingProject ? 'Update Project' : 'Create Project'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={() => {
                      setShowCreateProject(false);
                      setEditingProject(null);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* View Project Modal */}
        {viewingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewingProject(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-blue-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Project Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Project Name</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingProject.name}</p>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Client</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingProject.clientName}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-400 text-sm font-semibold mb-1">Description</label>
                  <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingProject.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Status</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      viewingProject.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      viewingProject.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                      viewingProject.status === 'Testing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {viewingProject.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Priority</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      viewingProject.priority === 'High' ? 'bg-red-500/20 text-red-400' :
                      viewingProject.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {viewingProject.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Progress</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${viewingProject.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-blue-400 text-sm font-medium">{viewingProject.progress}%</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-400 text-sm font-semibold mb-1">Technology Stack</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingProject.technology.map((tech, index) => (
                      <span key={index} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Budget</label>
                    <p className="text-green-400 font-bold text-lg">₹{viewingProject.budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Start Date</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingProject.startDate || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-blue-400 text-sm font-semibold mb-1">Due Date</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingProject.dueDate || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-400 text-sm font-semibold mb-1">Assigned To</label>
                  <p className="text-white bg-white/10 px-3 py-2 rounded-lg">{viewingProject.assignedTo || 'Not assigned'}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setViewingProject(null)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Referrer Modal */}
        {editingReferrer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setEditingReferrer(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-cyan-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Update Referrer</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const updates = {
                  phone: formData.get('phone'),
                  upi: formData.get('upi'),
                };
                updateReferrerInfo(editingReferrer.email, updates);
                setEditingReferrer(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Email (Read Only)</label>
                  <input
                    type="email"
                    value={editingReferrer.email}
                    disabled
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">Phone Number</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={editingReferrer.phone}
                    className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                </div>
                <div>
                  <label className="block text-cyan-400 text-sm font-semibold mb-2">UPI ID</label>
                  <input
                    name="upi"
                    type="text"
                    defaultValue={editingReferrer.upi}
                    className="w-full px-3 py-2 bg-slate-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                    placeholder="phone@paytm or email@upi"
                    required
                  />
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-300 text-sm">
                    <strong>Referral Codes:</strong> {editingReferrer.referralCodes?.length || 0} generated<br/>
                    <strong>Total Rewards:</strong> ₹{(editingReferrer.totalRewards || 0) * 500}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Update
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="button"
                    onClick={() => setEditingReferrer(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className={`fixed bottom-6 left-1/2 transform z-50 px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm border ${
                toastMessage.type === 'success' 
                  ? 'bg-green-500/90 border-green-400 text-white' 
                  : 'bg-red-500/90 border-red-400 text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                {toastMessage.type === 'success' ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-200" />
                ) : (
                  <ExclamationCircleIcon className="w-6 h-6 text-red-200" />
                )}
                <span className="font-medium">{toastMessage.message}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setToastMessage(null)}
                  className="ml-2 text-white/80 hover:text-white"
                >
                  <XMarkIcon className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 