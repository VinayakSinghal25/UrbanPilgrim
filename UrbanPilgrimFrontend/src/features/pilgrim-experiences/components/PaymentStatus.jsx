import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowLeftIcon
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
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-16 w-16 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />;
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
        return 'bg-green-50';
      case 'failed':
        return 'bg-red-50';
      default:
        return 'bg-yellow-50';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Payment Status</h1>
            <div className="w-9" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-2xl mx-auto bg-white">
          <div className="p-8 space-y-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            
            {/* Status Content */}
            <div className="text-center">
              <div className="mb-6">
                {getStatusIcon()}
              </div>
              
              <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
              </h1>
              
              <p className="text-gray-600 mb-8">
                {message}
              </p>
              
              <div className={`rounded-lg p-6 ${getStatusBgColor()}`}>
                <h3 className="font-semibold mb-2">
                  {status === 'success' ? 'What happens next?' : 'What you can do:'}
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 text-left">
                  {status === 'success' ? (
                    <>
                      <li>• You will receive a confirmation email shortly</li>
                      <li>• Your booking details will be available in your profile</li>
                      <li>• Our team will contact you with further instructions</li>
                    </>
                  ) : (
                    <>
                      <li>• You can try the payment again</li>
                      <li>• Contact our support team for assistance</li>
                      <li>• Check your payment method and try again</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                Go to Home
              </button>
              {status === 'success' && (
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 font-medium"
                >
                  View Bookings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-6">
          <div className="text-center">
            <div className="mb-6">
              {getStatusIcon()}
            </div>
            
            <h1 className={`text-xl font-bold mb-4 ${getStatusColor()}`}>
              {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            
            <div className={`rounded-lg p-4 mb-6 ${getStatusBgColor()}`}>
              <h3 className="font-semibold mb-2">
                {status === 'success' ? 'What happens next?' : 'What you can do:'}
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 text-left">
                {status === 'success' ? (
                  <>
                    <li>• You will receive a confirmation email shortly</li>
                    <li>• Your booking details will be available in your profile</li>
                    <li>• Our team will contact you with further instructions</li>
                  </>
                ) : (
                  <>
                    <li>• You can try the payment again</li>
                    <li>• Contact our support team for assistance</li>
                    <li>• Check your payment method and try again</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                Go to Home
              </button>
              {status === 'success' && (
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 font-medium"
                >
                  View Bookings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus; 