'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  CurrencyRupeeIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PhotoIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CreditCardIcon
} from '@heroicons/react/24/solid';

interface PaymentSystemProps {
  clientData: any;
  projectData: any;
  onPaymentUpdate: () => void;
}

interface Payment {
  id: string;
  paymentId: string;
  amount: number;
  paymentStep: number;
  status: string;
  projectName: string;
  dueDate: string;
  transactionId?: string;
  createdAt: any;
  proofSubmittedAt?: any;
  verifiedAt?: any;
}

interface PaymentRequest {
  paymentId: string;
  amount: number;
  step: number;
  projectName: string;
  upiUrl: string;
  qrData: string;
  note: string;
  dueDate: string;
}

export default function PaymentSystem({ clientData, projectData, onPaymentUpdate }: PaymentSystemProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState<PaymentRequest | null>(null);
  const [showProofUpload, setShowProofUpload] = useState<Payment | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Fetch client payments
  const fetchPayments = async () => {
    if (!clientData?.email) return;

    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/getClientPayments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: clientData.email
        })
      });

      const result = await response.json();
      if (result.success) {
        setPayments(result.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [clientData?.email]);

  // Generate payment QR for specific step
  const generatePaymentQR = async (step: number) => {
    if (!projectData?.id) {
      alert('Project not found');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/generatePaymentQR', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: clientData.email,
          paymentStep: step,
          projectId: projectData.id
        })
      });

      const result = await response.json();
      if (result.success) {
        setShowQR(result.payment);
        // Generate QR code image
        try {
          const qrDataUrl = await QRCode.toDataURL(result.payment.upiUrl, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrDataUrl);
        } catch (qrError) {
          console.error('Error generating QR code:', qrError);
        }
        await fetchPayments(); // Refresh payments list
      } else {
        alert(result.error || 'Failed to generate payment QR');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      alert('Error generating payment QR');
    }
    setLoading(false);
  };

  // Submit payment proof
  const submitPaymentProof = async (paymentId: string, transactionId: string, notes: string) => {
    setUploadingProof(true);
    try {
      const response = await fetch('https://us-central1-atoms-portfolio.cloudfunctions.net/submitPaymentProof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          clientEmail: clientData.email,
          transactionId,
          paymentMethod: 'UPI',
          notes
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Payment proof submitted successfully!');
        setShowProofUpload(null);
        await fetchPayments();
        onPaymentUpdate();
      } else {
        alert(result.error || 'Failed to submit payment proof');
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      alert('Error submitting payment proof');
    }
    setUploadingProof(false);
  };

  // Calculate payment structure
  const getPaymentStructure = () => {
    const totalAmount = clientData?.totalAmount || 0;
    return [
      { step: 1, percentage: 30, amount: Math.round(totalAmount * 0.30), label: 'Project Initiation' },
      { step: 2, percentage: 40, amount: Math.round(totalAmount * 0.40), label: 'Development Milestone' },
      { step: 3, percentage: 30, amount: Math.round(totalAmount * 0.30), label: 'Project Completion' }
    ];
  };

  const paymentStructure = getPaymentStructure();

  // Get payment status for a step
  const getStepStatus = (step: number) => {
    const payment = payments.find(p => p.paymentStep === step);
    if (!payment) return { status: 'pending', payment: null };
    return { status: payment.status, payment };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'proof_submitted': return 'text-blue-400 bg-blue-500/20';
      case 'verified_approved': return 'text-green-400 bg-green-500/20';
      case 'verified_rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified_approved': return <CheckCircleIcon className="w-5 h-5" />;
      case 'proof_submitted': return <ClockIcon className="w-5 h-5" />;
      case 'verified_rejected': return <XMarkIcon className="w-5 h-5" />;
      default: return <CurrencyRupeeIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Structure Overview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-purple-500/30 p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <CreditCardIcon className="w-6 h-6 mr-2 text-purple-400" />
          Structured Payment Plan
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {paymentStructure.map((step) => {
            const stepStatus = getStepStatus(step.step);
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step.step * 0.1 }}
                className={`p-4 rounded-lg border-2 ${
                  stepStatus.status === 'verified_approved' 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : stepStatus.status === 'proof_submitted'
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-gray-600 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 font-semibold">Step {step.step}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${getStatusColor(stepStatus.status)}`}>
                    {getStatusIcon(stepStatus.status)}
                    <span className="ml-1 capitalize">{stepStatus.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <div className="text-white font-bold text-lg">₹{step.amount.toLocaleString()}</div>
                <div className="text-gray-400 text-sm">{step.percentage}% - {step.label}</div>
                
                {stepStatus.status === 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => generatePaymentQR(step.step)}
                    disabled={loading}
                    className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Pay Now'}
                  </motion.button>
                )}
                
                {stepStatus.status === 'proof_submitted' && (
                  <div className="mt-3 text-center text-blue-300 text-sm">
                    Waiting for admin verification
                  </div>
                )}
                
                {stepStatus.payment && stepStatus.status === 'pending' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowProofUpload(stepStatus.payment)}
                    className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Upload Payment Proof
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-blue-200 text-sm">
              <p className="font-semibold mb-1">Payment Instructions:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Each step must be completed in sequence</li>
                <li>Scan the QR code with any UPI app (GPay, PhonePe, Paytm)</li>
                <li>Upload payment proof after successful payment</li>
                <li>Admin will verify and approve within 24 hours</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
                         className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={() => {
               setShowQR(null);
               setQrCodeDataUrl('');
             }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-purple-500/30"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">Payment Step {showQR.step}</h3>
                <div className="bg-white p-6 rounded-lg mb-4 shadow-lg">
                  <div className="flex items-center justify-center h-64">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Payment QR Code" 
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center">
                        <QrCodeIcon className="w-32 h-32 text-gray-600 animate-pulse" />
                        <p className="text-gray-600 text-sm mt-2">Generating QR Code...</p>
                      </div>
                    )}
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-gray-700 font-semibold">Scan with any UPI app</p>
                    <p className="text-gray-500 text-xs mt-1">GPay • PhonePe • Paytm • Any UPI App</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white font-bold">₹{showQR.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project:</span>
                    <span className="text-white">{showQR.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Due:</span>
                    <span className="text-white">{new Date(showQR.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <motion.a
                    href={showQR.upiUrl}
                    whileHover={{ scale: 1.05 }}
                    className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    📱 Open UPI App
                  </motion.a>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      navigator.clipboard.writeText(showQR.upiUrl);
                      alert('UPI link copied to clipboard!');
                    }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    📋 Copy UPI Link
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                                         onClick={() => {
                       setShowQR(null);
                       setQrCodeDataUrl('');
                       setTimeout(() => {
                         const payment = payments.find(p => p.paymentId === showQR.paymentId);
                         if (payment) setShowProofUpload(payment);
                       }, 500);
                     }}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    I've Made the Payment
                  </motion.button>
                  
                  <button
                    onClick={() => {
               setShowQR(null);
               setQrCodeDataUrl('');
             }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Proof Upload Modal */}
      <AnimatePresence>
        {showProofUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowProofUpload(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-purple-500/30"
            >
              <h3 className="text-xl font-bold text-white mb-4">Upload Payment Proof</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const transactionId = formData.get('transactionId') as string;
                const notes = formData.get('notes') as string;
                
                if (!transactionId) {
                  alert('Transaction ID is required');
                  return;
                }
                
                submitPaymentProof(showProofUpload.paymentId, transactionId, notes);
              }} className="space-y-4">
                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
                    Transaction ID *
                  </label>
                  <input
                    name="transactionId"
                    type="text"
                    required
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter UPI transaction ID"
                  />
                </div>

                <div>
                  <label className="block text-purple-400 text-sm font-semibold mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    placeholder="Any additional information about the payment"
                  />
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-yellow-200 text-sm">
                      Please ensure the transaction ID matches your UPI payment. Admin will verify this information.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    type="submit"
                    disabled={uploadingProof}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploadingProof ? 'Uploading...' : 'Submit Proof'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowProofUpload(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 