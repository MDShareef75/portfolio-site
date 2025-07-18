'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PaymentSystem from '../components/PaymentSystem';
import { 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ChartBarIcon,
  CurrencyRupeeIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon
} from '@heroicons/react/24/solid';

interface ClientData {
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  discount: number;
  paymentStatus: string;
  projectStatus: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: any;
  projectDetails?: {
    type: string;
    description: string;
    timeline: string;
    features: string[];
  };
}

interface ProjectData {
  id: string;
  name: string;
  description: string;
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

interface ProjectStep {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  dueDate?: string;
  description: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  response?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: string;
}

export default function ClientPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payments' | 'files' | 'requests'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [validationErrors, setValidationErrors] = useState({ email: '', password: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataChanged, setDataChanged] = useState(false);
  const [previousData, setPreviousData] = useState<ClientData | null>(null);
  const [autoRefreshIndicator, setAutoRefreshIndicator] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Fetch change requests only
  const fetchChangeRequests = async () => {
    if (!clientData) return;
    
    try {
      const requestsResponse = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/getChangeRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: clientData.email
        })
      });

      const requestsResult = await requestsResponse.json();
      if (requestsResult.success) {
        setChangeRequests(requestsResult.requests || []);
      }
    } catch (error) {
      console.error('Error fetching change requests:', error);
    }
  };

  // Fetch client project data and change requests from Firebase
  const fetchClientProjectData = async () => {
    if (!clientData) return;
    
    try {
      // Fetch detailed project information
      const projectResponse = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/getClientProjectDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: clientData.email
        })
      });

      const projectResult = await projectResponse.json();
      if (projectResult.success) {
        // Update client data with latest info from server
        setClientData(projectResult.client);
        // Set project data
        setProjectData(projectResult.project);
      }

      // Also fetch change requests
      await fetchChangeRequests();
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  // Dynamic project steps based on real project status from Firebase
  const getProjectSteps = (): ProjectStep[] => {
    const status = projectData?.status || clientData?.projectStatus;
    const startDate = projectData?.startDate;
    const dueDate = projectData?.dueDate;
    
    if (!status) {
      return [];
    }

    // Generate dates based on project timeline
    const getStepDate = (offset: number) => {
      if (startDate) {
        const start = new Date(startDate);
        start.setDate(start.getDate() + (offset * 7)); // Add weeks
        return start.toISOString().split('T')[0];
      }
      return '';
    };

    const baseSteps = [
      { id: 1, title: 'Project Planning & Design', description: 'Requirements gathering and UI/UX design', dueDate: getStepDate(2) || '2025-08-05' },
      { id: 2, title: 'Frontend Development', description: 'React/Next.js frontend implementation', dueDate: getStepDate(4) || '2025-08-15' },
      { id: 3, title: 'Backend Development', description: 'API development and database setup', dueDate: getStepDate(6) || '2025-08-25' },
      { id: 4, title: 'Testing & Deployment', description: 'Quality assurance and production deployment', dueDate: dueDate || '2025-09-01' },
    ];

    // Map project status to step completion with real progress
    const progress = projectData?.progress || 0;
    const statusToStepMapping: { [key: string]: number } = {
      'Not Started': 0,
      'Planning': 0,
      'In Progress': Math.floor(progress / 25), // 0-100% maps to 0-4 steps
      'Development': 2,
      'Testing': 3,
      'Completed': 4,
      'On Hold': Math.floor(progress / 25)
    };

    const completedSteps = Math.min(statusToStepMapping[status] || Math.floor(progress / 25), 4);

    return baseSteps.map((step, index) => ({
      ...step,
      status: index < completedSteps ? 'completed' : 
              index === completedSteps ? 'in_progress' : 'pending'
    }));
  };

  const projectSteps = getProjectSteps();

  // Mock uploaded files - in real implementation, this would come from Firebase Storage
  const uploadedFiles: UploadedFile[] = [];

  // Refresh client data from server
  const refreshClientData = async (showLoader = false) => {
    if (!loginData.email || !loginData.password || !isAuthenticated) {
      console.log('Refresh skipped: missing authentication data');
      return;
    }
    
    if (showLoader) setRefreshing(true);
    
    try {
      console.log('🔄 Refreshing client data...', { showLoader });
      
      // Use the new getClientProjectDetails endpoint for comprehensive data
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/getClientProjectDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: loginData.email.toLowerCase()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Refresh response:', result);

      if (result.success) {
        // Check if data has changed
        const hasChanged = clientData && (
          clientData.projectStatus !== result.client.projectStatus ||
          clientData.paymentStatus !== result.client.paymentStatus ||
          clientData.totalAmount !== result.client.totalAmount ||
          clientData.paidAmount !== result.client.paidAmount ||
          (projectData?.status !== result.project?.status) ||
          (projectData?.progress !== result.project?.progress)
        );

        if (hasChanged) {
          setPreviousData(clientData);
          setDataChanged(true);
          console.log('Data changed detected!');
          // Clear the change notification after 5 seconds
          setTimeout(() => setDataChanged(false), 5000);
        }

        setClientData(result.client);
        setProjectData(result.project);
        setLastUpdated(new Date());
        
        // Show auto-refresh indicator for silent refreshes
        if (!showLoader) {
          setAutoRefreshIndicator(true);
          setTimeout(() => {
            setAutoRefreshIndicator(false);
            setShowSyncSuccess(true);
            setTimeout(() => setShowSyncSuccess(false), 1500);
          }, 1000);
        }
        
        // Fetch change requests separately to avoid conflicts
        try {
          await fetchChangeRequests();
        } catch (requestError) {
          console.error('Error fetching change requests:', requestError);
        }
        
        console.log('✅ Client data refreshed successfully');
      } else {
        throw new Error(result.error || 'Failed to refresh data');
      }
    } catch (error) {
      console.error('❌ Error refreshing client data:', error);
      // Show error feedback to user
      if (showLoader) {
        alert('Failed to refresh data. Please try again.');
      }
    }
    
    if (showLoader) setRefreshing(false);
  };

  // Fetch change requests when client data is available
  useEffect(() => {
    if (clientData && isAuthenticated) {
      fetchClientProjectData();
      setLastUpdated(new Date());
    }
  }, [clientData, isAuthenticated]);

  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshClientData(false); // Silent refresh
      console.log('🔄 Auto-refreshing client data...'); // Debug log
          }, 15000); // 15 seconds for more responsive updates

    return () => clearInterval(interval);
  }, [isAuthenticated, loginData.email, loginData.password]);

  // Manual refresh function
  const handleManualRefresh = () => {
    console.log('🔄 Manual refresh button clicked!');
    refreshClientData(true); // Show loading indicator
  };

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(loginData.email);
    const passwordError = validatePassword(loginData.password);
    
    setValidationErrors({
      email: emailError,
      password: passwordError
    });

    return !emailError && !passwordError;
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'email') {
      setLoginData(prev => ({ ...prev, email: value }));
    } else if (field === 'password') {
      setLoginData(prev => ({ ...prev, password: value }));
    }
  };

  const getFieldStatus = (field: 'email' | 'password'): 'default' | 'error' | 'success' => {
    const value = loginData[field];
    const error = validationErrors[field];
    
    if (error) return 'error';
    if (value && ((field === 'email' && validateEmail(value) === '') || 
                  (field === 'password' && validatePassword(value) === ''))) {
      return 'success';
    }
    return 'default';
  };

  // Real authentication with Firebase
  const handleLogin = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/clientLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email.toLowerCase(),
          password: loginData.password
        })
      });

      const result = await response.json();

      if (result.success) {
        setClientData(result.client);
        setIsAuthenticated(true);
        // Clear any validation errors on successful login
        setValidationErrors({ email: '', password: '' });
      } else {
        alert(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleSubmitRequest = async () => {
    if (newRequest.title && newRequest.description && clientData) {
      try {
        const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/submitChangeRequest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientEmail: clientData.email,
            title: newRequest.title,
            description: newRequest.description
          })
        });

        const result = await response.json();
        if (result.success) {
          setNewRequest({ title: '', description: '' });
          setShowRequestForm(false);
          alert('Request submitted successfully!');
          // Refresh data to show new request
          fetchClientProjectData();
        } else {
          alert('Failed to submit request');
        }
      } catch (error) {
        console.error('Error submitting request:', error);
        alert('Error submitting request');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setUploadingFile(true);
      // Simulate upload
      setTimeout(() => {
        setUploadingFile(false);
        // Add to uploaded files list
      }, 2000);
    }
  };

  const getProgressPercentage = () => {
    // Use real project progress if available, otherwise fall back to status-based calculation
    if (projectData && projectData.progress !== undefined) {
      return projectData.progress;
    }
    
    if (!clientData) return 0;
    
    // Calculate progress based on project status
    const statusToProgress: { [key: string]: number } = {
      'Not Started': 0,
      'Planning': 10,
      'In Progress': 25,
      'Development': 50,
      'Testing': 75,
      'Completed': 100
    };

    return statusToProgress[clientData.projectStatus] || 0;
  };

  const getTimelineInfo = () => {
    // Use real project data if available
    if (projectData) {
      const status = projectData.status;
      const dueDate = projectData.dueDate;
      
      if (dueDate) {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        
        if (status === 'Completed') {
          return { weeks: 'Completed', description: 'Project delivered' };
        } else if (diffWeeks <= 0) {
          return { weeks: 'Overdue', description: `Project was due on ${due.toLocaleDateString()}` };
        } else {
          return { weeks: `${diffWeeks} weeks`, description: `Due on ${due.toLocaleDateString()}` };
        }
      }
      
      return { weeks: 'TBD', description: projectData.status };
    }
    
    if (!clientData) return { weeks: 'N/A', description: 'Project not started' };
    
    const statusToTimeline: { [key: string]: { weeks: string, description: string } } = {
      'Not Started': { weeks: '8 weeks', description: 'Awaiting project initiation' },
      'Planning': { weeks: '7-8 weeks', description: 'Project planning phase' },
      'In Progress': { weeks: '6-7 weeks', description: 'Development in progress' },
      'Development': { weeks: '4-5 weeks', description: 'Backend development' },
      'Testing': { weeks: '2-3 weeks', description: 'Testing and refinement' },
      'Completed': { weeks: 'Completed', description: 'Project delivered' }
    };

    return statusToTimeline[clientData.projectStatus] || { weeks: 'N/A', description: 'Status unknown' };
  };

  const getPaymentPercentage = () => {
    if (!clientData || clientData.totalAmount === 0) return 0;
    return (clientData.paidAmount / clientData.totalAmount) * 100;
  };

  const getPaymentStatusColor = () => {
    if (!clientData) return 'from-gray-500 to-gray-600';
    
    const statusColors: { [key: string]: string } = {
      'Pending': 'from-red-500 to-red-600',
      'Paid Step 1': 'from-yellow-500 to-orange-500',
      'Partially Paid': 'from-blue-500 to-cyan-500',
      'Fully Paid': 'from-green-500 to-emerald-500'
    };

    return statusColors[clientData.paymentStatus] || 'from-gray-500 to-gray-600';
  };

  const getProjectStatusColor = () => {
    const status = projectData?.status || clientData?.projectStatus;
    if (!status) return 'from-gray-500 to-gray-600';
    
    const statusColors: { [key: string]: string } = {
      'Not Started': 'from-gray-500 to-gray-600',
      'Planning': 'from-blue-500 to-cyan-500',
      'In Progress': 'from-purple-500 to-indigo-500',
      'Development': 'from-orange-500 to-yellow-500',
      'Testing': 'from-yellow-500 to-green-500',
      'Completed': 'from-green-500 to-emerald-500',
      'On Hold': 'from-red-500 to-orange-500'
    };

    return statusColors[status] || 'from-purple-500 to-indigo-500';
  };

  const getProjectDescription = () => {
    if (projectData?.description) {
      return projectData.description;
    }
    if (!clientData?.projectDetails?.description) {
      return 'Custom software solution tailored to your business needs';
    }
    return clientData.projectDetails.description;
  };

  const getProjectType = () => {
    if (projectData?.name) {
      return projectData.name;
    }
    if (!clientData?.projectDetails?.type) {
      return 'Custom Development Project';
    }
    return clientData.projectDetails.type;
  };

  const getProjectFeatures = () => {
    if (projectData?.technology && projectData.technology.length > 0) {
      return projectData.technology;
    }
    if (!clientData?.projectDetails?.features || clientData.projectDetails.features.length === 0) {
      // Default features based on project status
      return [
        'Requirements Analysis',
        'Custom Development',
        'Testing & Quality Assurance',
        'Deployment & Support'
      ];
    }
    return clientData.projectDetails.features;
  };

  const getPaymentStatusDescription = () => {
    if (!clientData) return '';
    
    const statusDescriptions: { [key: string]: string } = {
      'Pending': 'Awaiting initial payment to begin project',
      'Paid Step 1': 'Step 1 payment received - Project initiated',
      'Partially Paid': 'Partial payment received - Development ongoing',
      'Fully Paid': 'All payments completed - Project delivered'
    };

    return statusDescriptions[clientData.paymentStatus] || '';
  };

  const getNextPaymentInfo = () => {
    if (!clientData) return { amount: 0, description: '' };
    
    const remaining = clientData.totalAmount - clientData.paidAmount;
    const progressPercentage = getPaymentPercentage();
    
    if (progressPercentage >= 100) {
      return { amount: 0, description: 'All payments completed' };
    } else if (progressPercentage >= 50) {
      return { amount: remaining, description: 'Final payment due on completion' };
    } else if (progressPercentage > 0) {
      return { amount: remaining / 2, description: 'Next milestone payment' };
    } else {
      return { amount: clientData.totalAmount * 0.33, description: 'Step 1 payment to begin project' };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 w-full max-w-md"
        >
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-4">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Client Portal</h1>
            <p className="text-gray-300">Access your project dashboard</p>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div>
              <label className="block text-purple-400 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  autoComplete="email"
                  className={`w-full pl-10 pr-3 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    getFieldStatus('email') === 'error'
                      ? 'border-red-500 focus:border-red-400' 
                      : getFieldStatus('email') === 'success'
                      ? 'border-green-500 focus:border-green-400'
                      : 'border-gray-600 focus:border-purple-500'
                  }`}
                  placeholder="your@email.com"
                />
              </div>
              {validationErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {validationErrors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-purple-400 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-3 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none transition-colors ${
                    getFieldStatus('password') === 'error'
                      ? 'border-red-500 focus:border-red-400' 
                      : getFieldStatus('password') === 'success'
                      ? 'border-green-500 focus:border-green-400'
                      : 'border-gray-600 focus:border-purple-500'
                  }`}
                  placeholder="Your password"
                />
              </div>
              {validationErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {validationErrors.password}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: loading || !loginData.email || !loginData.password ? 1 : 1.02 }}
              whileTap={{ scale: loading || !loginData.email || !loginData.password ? 1 : 0.98 }}
              disabled={loading || !loginData.email || !loginData.password}
              className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
                loading || !loginData.email || !loginData.password
                  ? 'bg-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Access Portal'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Use the email and password from your signup to access your project dashboard.
            </p>
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <ExclamationCircleIcon className="w-4 h-4 text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-blue-300 text-xs font-semibold mb-1">Login Requirements:</p>
                  <ul className="text-blue-200 text-xs space-y-1">
                    <li>• Valid email address (example@domain.com)</li>
                    <li>• Password (minimum 6 characters)</li>
                  </ul>
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/client-portal/signup" className="text-purple-400 hover:text-purple-300 underline font-semibold">
                Sign up with referral code
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {clientData?.name}!</h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <span>📧 {clientData?.email}</span>
                <span>🎫 {clientData?.referralCode}</span>
                <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                  {clientData?.discount}% Discount Applied
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-4 md:mt-0">
              {/* Last Updated Info */}
              <div className="text-right">
                <div className="flex items-center text-xs text-gray-400 mb-1">
                  <div className={`w-2 h-2 rounded-full mr-2 transition-all duration-200 ${
                    autoRefreshIndicator 
                      ? 'bg-blue-400 animate-ping' 
                      : showSyncSuccess
                      ? 'bg-green-500 animate-pulse'
                      : 'bg-green-400 animate-pulse'
                  }`}></div>
                  {autoRefreshIndicator ? 'Syncing...' : 
                   showSyncSuccess ? '✓ Synced' : 'Auto-refresh: 15s'}
                </div>
                {lastUpdated && (
                  <div className="text-xs text-gray-300">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
              
              {/* Refresh Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleManualRefresh}
                disabled={refreshing}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                  refreshing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                  className="mr-2"
                >
                  🔄
                </motion.div>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </motion.button>
              
              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsAuthenticated(false)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Data Change Notification */}
        <AnimatePresence>
          {dataChanged && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-green-500/20 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <div>
                  <p className="text-green-300 font-semibold">✨ Project Updated!</p>
                  <p className="text-green-200 text-sm">
                    Your project information has been updated by the admin.
                  </p>
                  {previousData && (
                    <div className="mt-2 text-xs text-green-200/80">
                      {previousData.projectStatus !== clientData?.projectStatus && (
                        <div>Project Status: {previousData.projectStatus} → {clientData?.projectStatus}</div>
                      )}
                      {previousData.paymentStatus !== clientData?.paymentStatus && (
                        <div>Payment Status: {previousData.paymentStatus} → {clientData?.paymentStatus}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              { id: 'payments', label: 'Payments', icon: CurrencyRupeeIcon },
              { id: 'files', label: 'Files', icon: DocumentIcon },
              { id: 'requests', label: 'Requests', icon: ChatBubbleLeftRightIcon },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Project Overview Cards */}
            <motion.div 
              key={`${clientData?.projectStatus}-${clientData?.paymentStatus}-${clientData?.paidAmount}`}
              initial={{ scale: 1 }}
              animate={dataChanged ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className={`bg-gradient-to-r ${getProjectStatusColor()} p-6 rounded-2xl text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Project Progress</p>
                    <p className="text-2xl font-bold">{getProgressPercentage().toFixed(0)}%</p>
                  </div>
                  <ChartBarIcon className="w-10 h-10 text-white/80" />
                </div>
                <div className="mt-4 bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage()}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-white h-2 rounded-full"
                  />
                </div>
              </div>

              <div className={`bg-gradient-to-r ${getPaymentStatusColor()} p-6 rounded-2xl text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Payment Progress</p>
                    <p className="text-2xl font-bold">{getPaymentPercentage().toFixed(0)}%</p>
                  </div>
                  <CurrencyRupeeIcon className="w-10 h-10 text-white/80" />
                </div>
                <div className="mt-4 bg-white/20 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPaymentPercentage()}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="bg-white h-2 rounded-full"
                  />
                </div>
              </div>

              <div className={`bg-gradient-to-r ${getProjectStatusColor()} p-6 rounded-2xl text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Project Status</p>
                    <p className="text-2xl font-bold">{projectData?.status || clientData?.projectStatus}</p>
                  </div>
                  <ClockIcon className="w-10 h-10 text-white/80" />
                </div>
                <p className="mt-2 text-white/80 text-sm">
                  {getTimelineInfo().weeks} timeline
                </p>
              </div>
            </motion.div>

            {/* Project Timeline */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Project Timeline</h3>
              <div className="space-y-4">
                {projectSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`}>
                      {step.status === 'completed' ? (
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      ) : step.status === 'in_progress' ? (
                        <ClockIcon className="w-6 h-6 text-white" />
                      ) : (
                        <span className="text-white font-bold">{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-semibold">{step.title}</h4>
                        {step.dueDate && (
                          <span className="text-gray-400 text-sm">{step.dueDate}</span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-cyan-400 font-semibold mb-2">Project Type</h4>
                  <p className="text-white">{getProjectType()}</p>
                </div>
                <div>
                  <h4 className="text-cyan-400 font-semibold mb-2">Timeline</h4>
                  <p className="text-white">{getTimelineInfo().weeks} - {getTimelineInfo().description}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-cyan-400 font-semibold mb-2">Description</h4>
                  <p className="text-white">{getProjectDescription()}</p>
                </div>
                <div className="md:col-span-2">
                  <h4 className="text-cyan-400 font-semibold mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {getProjectFeatures().map((feature, index) => (
                      <span
                        key={index}
                        className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && clientData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-green-500/30 p-6">
                <h3 className="text-green-400 font-semibold mb-2">Total Amount</h3>
                <p className="text-2xl font-bold text-white">₹{clientData.totalAmount.toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Original: ₹{Math.round(clientData.totalAmount / 0.75).toLocaleString()} 
                  <span className="text-green-400 ml-2">(25% discount applied)</span>
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6">
                <h3 className="text-blue-400 font-semibold mb-2">Amount Paid</h3>
                <p className="text-2xl font-bold text-white">₹{clientData.paidAmount.toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {getPaymentPercentage().toFixed(1)}% of total amount
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6">
                <h3 className="text-orange-400 font-semibold mb-2">Balance Due</h3>
                <p className="text-2xl font-bold text-white">₹{(clientData.totalAmount - clientData.paidAmount).toLocaleString()}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {(100 - getPaymentPercentage()).toFixed(1)}% remaining
                </p>
              </div>
            </div>

            {/* Structured Payment System */}
            <PaymentSystem 
              clientData={clientData}
              projectData={projectData}
              onPaymentUpdate={() => refreshClientData(false)}
            />

            {/* Payment Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Payment Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 font-semibold text-lg">{clientData.paymentStatus}</p>
                  <p className="text-gray-300 text-sm">{getPaymentStatusDescription()}</p>
                </div>
                {getNextPaymentInfo().amount > 0 && (
                  <div className="text-right">
                    <p className="text-white font-bold">Next: ₹{getNextPaymentInfo().amount.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">{getNextPaymentInfo().description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Payment Schedule</h3>
              <div className="space-y-4">
                {[
                  { step: 'Step 1 (Advance)', amount: clientData.totalAmount * 0.33, status: 'paid', dueDate: '2025-08-01' },
                  { step: 'Step 2 (Milestone)', amount: clientData.totalAmount * 0.33, status: 'pending', dueDate: '2025-08-15' },
                  { step: 'Step 3 (Final)', amount: clientData.totalAmount * 0.34, status: 'pending', dueDate: '2025-09-01' },
                ].map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        payment.status === 'paid' ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <h4 className="text-white font-semibold">{payment.step}</h4>
                        <p className="text-gray-400 text-sm">Due: {payment.dueDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">₹{Math.round(payment.amount).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {payment.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          </motion.div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Upload Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Upload Files</h3>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">
                  Drag and drop files here, or click to select
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <motion.label
                  htmlFor="file-upload"
                  whileHover={{ scale: 1.02 }}
                  className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all duration-300"
                >
                  {uploadingFile ? 'Uploading...' : 'Choose Files'}
                </motion.label>
                <p className="text-gray-400 text-sm mt-2">
                  Supported: Images, Documents, Archives (Max 10MB per file)
                </p>
              </div>
            </div>

            {/* Uploaded Files */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Your Files</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        file.type === 'image' ? 'bg-green-500/20' :
                        file.type === 'document' ? 'bg-blue-500/20' :
                        'bg-purple-500/20'
                      }`}>
                        <DocumentIcon className={`w-6 h-6 ${
                          file.type === 'image' ? 'text-green-400' :
                          file.type === 'document' ? 'text-blue-400' :
                          'text-purple-400'
                        }`} />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{file.name}</h4>
                        <p className="text-gray-400 text-sm">{file.size} • {file.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* New Request Button */}
            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowRequestForm(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Request
              </motion.button>
            </div>

            {/* Change Requests List */}
            <div className="space-y-4">
              {changeRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold text-lg">{request.title}</h3>
                      <p className="text-gray-400 text-sm">Submitted on {request.submittedAt}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-4">{request.description}</p>
                  {request.response && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Response:</h4>
                      <p className="text-gray-300">{request.response}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* New Request Form Modal */}
            <AnimatePresence>
              {showRequestForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowRequestForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-purple-500/30"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Submit Change Request</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-purple-400 text-sm font-semibold mb-2">
                          Request Title
                        </label>
                        <input
                          type="text"
                          value={newRequest.title}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="Brief title for your request"
                        />
                      </div>
                      <div>
                        <label className="block text-purple-400 text-sm font-semibold mb-2">
                          Description
                        </label>
                        <textarea
                          value={newRequest.description}
                          onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                          placeholder="Detailed description of your change request"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={handleSubmitRequest}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                          Submit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={() => setShowRequestForm(false)}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
} 