import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const razorpayOrderId = searchParams.get('razorpay_order_id');
    const razorpayPaymentId = searchParams.get('razorpay_payment_id');
    const razorpaySignature = searchParams.get('razorpay_signature');
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');

    if (errorCode) {
      setStatus('failed');
      setMessage(errorDescription || 'Payment failed');
    } else if (razorpayPaymentId && razorpaySignature) {
      setStatus('success');
      setMessage('Payment completed successfully!');
    } else {
      setStatus('failed');
      setMessage('Payment verification failed');
    }
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-0 bg-green-400 rounded-full animate-pulse opacity-30"></div>
            <CheckCircleIcon className="h-20 w-20 text-green-500 relative z-10" />
          </div>
        );
      case 'failed':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
            <XCircleIcon className="h-20 w-20 text-red-500 relative z-10" />
          </div>
        );
      default:
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-20"></div>
            <ExclamationTriangleIcon className="h-20 w-20 text-yellow-500 relative z-10" />
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200';
      case 'failed':
        return 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200';
      default:
        return 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200';
    }
  };

  const getStatusGradient = () => {
    switch (status) {
      case 'success':
        return 'from-green-400 to-emerald-500';
      case 'failed':
        return 'from-red-400 to-pink-500';
      default:
        return 'from-yellow-400 to-orange-500';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-ping"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium animate-pulse">Verifying payment...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we process your transaction</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Payment Status</h1>
            <div className="w-9" />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto py-12 px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-12 space-y-8">
              {/* Back Button */}
                              <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                  Back to Home
                </button>
              
              {/* Status Content */}
              <div className="text-center">
                <div className="mb-8 animate-fade-in">
                  {getStatusIcon()}
                </div>
                
                <h1 className={`text-4xl font-bold mb-4 ${getStatusColor()} animate-fade-in`}>
                  {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
                </h1>
                
                <p className="text-gray-600 mb-8 text-lg animate-fade-in">
                  {message}
                </p>
                
                <div className={`rounded-2xl p-8 border ${getStatusBgColor()} shadow-lg`}>
                  <h3 className="font-bold text-xl mb-6 text-gray-800">
                    {status === 'success' ? 'What happens next?' : 'What you can do:'}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {status === 'success' ? (
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="bg-green-100 p-2 rounded-full animate-pulse">
                            <EnvelopeIcon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Email Confirmation</h4>
                            <p className="text-sm text-gray-600">You will receive a confirmation email shortly</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full animate-pulse">
                            <UserIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Profile Access</h4>
                            <p className="text-sm text-gray-600">Your booking details will be available in your profile</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 p-2 rounded-full animate-pulse">
                            <PhoneIcon className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Team Contact</h4>
                            <p className="text-sm text-gray-600">Our team will contact you with further instructions</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start space-x-3">
                          <div className="bg-red-100 p-2 rounded-full animate-pulse">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Try Again</h4>
                            <p className="text-sm text-gray-600">You can try the payment again</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full animate-pulse">
                            <PhoneIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Contact Support</h4>
                            <p className="text-sm text-gray-600">Contact our support team for assistance</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-full animate-pulse">
                            <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Check Payment</h4>
                            <p className="text-sm text-gray-600">Check your payment method and try again</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-6">
                <button
                  onClick={() => navigate('/')}
                  className={`px-8 py-4 bg-gradient-to-r ${getStatusGradient()} text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-lg`}
                >
                  Go to Home
                </button>
                {status === 'success' && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-8 py-4 border-2 border-amber-600 text-amber-600 rounded-xl hover:bg-amber-50 transition-all duration-200 font-semibold text-lg"
                  >
                    View Bookings
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-6 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="text-center">
              <div className="mb-8 animate-fade-in">
                {getStatusIcon()}
              </div>
              
              <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()} animate-fade-in`}>
                {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
              </h1>
              
              <p className="text-gray-600 mb-8 text-lg animate-fade-in">
                {message}
              </p>
              
              <div className={`rounded-2xl p-6 border ${getStatusBgColor()} mb-8`}>
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  {status === 'success' ? 'What happens next?' : 'What you can do:'}
                </h3>
                <div className="space-y-4">
                  {status === 'success' ? (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-full animate-pulse">
                          <EnvelopeIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Email Confirmation</h4>
                          <p className="text-sm text-gray-600">You will receive a confirmation email shortly</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full animate-pulse">
                          <UserIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Profile Access</h4>
                          <p className="text-sm text-gray-600">Your booking details will be available in your profile</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-purple-100 p-2 rounded-full animate-pulse">
                          <PhoneIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Team Contact</h4>
                          <p className="text-sm text-gray-600">Our team will contact you with further instructions</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start space-x-3">
                        <div className="bg-red-100 p-2 rounded-full animate-pulse">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Try Again</h4>
                          <p className="text-sm text-gray-600">You can try the payment again</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full animate-pulse">
                          <PhoneIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Contact Support</h4>
                          <p className="text-sm text-gray-600">Contact our support team for assistance</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-yellow-100 p-2 rounded-full animate-pulse">
                          <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Check Payment</h4>
                          <p className="text-sm text-gray-600">Check your payment method and try again</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/')}
                  className={`w-full px-6 py-4 bg-gradient-to-r ${getStatusGradient()} text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold text-lg`}
                >
                  Go to Home
                </button>
                {status === 'success' && (
                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full px-6 py-4 border-2 border-amber-600 text-amber-600 rounded-xl hover:bg-amber-50 transition-all duration-200 font-semibold text-lg"
                  >
                    View Bookings
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaymentStatus; 