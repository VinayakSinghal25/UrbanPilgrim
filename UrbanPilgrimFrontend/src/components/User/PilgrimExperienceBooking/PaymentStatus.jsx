// src/components/User/PilgrimExperienceBooking/PaymentStatus.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { bookingApi } from '../../../api/bookingApi';
import { classBookingApi } from '../../../api/classBookingApi';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [paymentStatus, setPaymentStatus] = useState('processing'); // processing, success, failed, timeout
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes initially
  const [currentTimeout, setCurrentTimeout] = useState(300); // Track current timeout duration
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Get payment parameters from URL
  const razorpayOrderId = searchParams.get('razorpay_order_id');
  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpaySignature = searchParams.get('razorpay_signature');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');
  const flowType = searchParams.get('type') || 'experience'; // 'experience' | 'class'

  useEffect(() => {
    if (razorpayPaymentId && razorpaySignature) {
      // Payment successful, handle callback
      handlePaymentSuccess();
    } else if (errorCode) {
      // Payment failed
      handlePaymentFailure();
    } else {
      // Wait for payment completion
      setPaymentStatus('processing');
      startTimer();
    }
  }, [razorpayPaymentId, razorpaySignature, errorCode]);

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handlePaymentSuccess = async () => {
    try {
      setPaymentStatus('processing');
      
      const paymentData = {
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature
      };

      const response = await (flowType === 'class' ? classBookingApi.handlePaymentCallback : bookingApi.handlePaymentCallback)(paymentData);
      
      if (response.success) {
        setPaymentStatus('success');
        setBookingDetails(response.data);
      } else {
        setPaymentStatus('failed');
        setError(response.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment callback error:', error);
      setPaymentStatus('failed');
      setError(error.message || 'Failed to process payment');
    }
  };

  const handlePaymentFailure = async () => {
    try {
      const failureData = {
        razorpay_order_id: razorpayOrderId,
        error_code: errorCode,
        error_description: errorDescription
      };

      await (flowType === 'class' ? classBookingApi.handlePaymentFailure : bookingApi.handlePaymentFailure)(failureData);
      setPaymentStatus('failed');
      setError(errorDescription || 'Payment failed');
    } catch (error) {
      console.error('Payment failure handling error:', error);
      setPaymentStatus('failed');
      setError(error.message || 'Payment failed');
    }
  };

  const handleTimeout = () => {
    setPaymentStatus('timeout');
    // Increase timeout duration for next attempt (5 min -> 10 min -> 15 min, etc.)
    const newTimeout = currentTimeout + 300; // Add 5 minutes
    setCurrentTimeout(newTimeout);
    setTimeLeft(newTimeout);
  };

  const retryPaymentCheck = async () => {
    setIsRetrying(true);
    setPaymentStatus('processing');
    setTimeLeft(currentTimeout);
    
    try {
      // Check if payment was completed in the meantime
      // This would require a separate API to check payment status
      // For now, just restart the timer
      startTimer();
    } catch (error) {
      console.error('Retry error:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMyBookings = () => {
    navigate('/my-bookings');
  };

  const handleTryAgain = () => {
    navigate(-1); // Go back to booking review
  };

  // Loading/Processing State
  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <ClockIcon className="h-5 w-5 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-amber-800">
                Waiting for confirmation
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-900">
              {formatTime(timeLeft)}
            </div>
            <p className="text-xs text-amber-700 mt-1">
              This page will automatically update when payment is confirmed
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>Don't close this page. Payment confirmation is in progress.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success State
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              {flowType === 'class' ? 'Your class booking has been confirmed successfully.' : 'Your booking has been confirmed successfully.'}
            </p>
          </div>

          {bookingDetails && (
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-green-900 mb-2">Booking Details</h3>
              <div className="space-y-1 text-sm text-green-800">
                <p><span className="font-medium">Booking ID:</span> {bookingDetails.bookingId}</p>
                <p><span className="font-medium">Status:</span> {bookingDetails.status}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={handleMyBookings}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 mb-3 flex items-center justify-center"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" /> View My Bookings
            </button>

            <button
              onClick={() => navigate(flowType === 'class' ? '/wellness-guide-classes' : '/pilgrim-experiences')}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              {flowType === 'class' ? 'Browse Classes' : 'Explore More Experiences'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600">
              We couldn't process your payment. Please try again.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(flowType === 'class' ? '/wellness-guide-classes' : '/pilgrim-experiences')}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              {flowType === 'class' ? 'Browse Classes' : 'Browse Experiences'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Timeout State
  if (paymentStatus === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <ClockIcon className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Timeout</h2>
            <p className="text-gray-600">
              We're still waiting for payment confirmation. This might take a little longer.
            </p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800">
              Your payment might still be processing. Check again or contact support if needed.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={retryPaymentCheck}
              disabled={isRetrying}
              className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium flex items-center justify-center"
            >
              {isRetrying ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Check Again ({formatTime(currentTimeout)})
                </>
              )}
            </button>
            <button
              onClick={() => navigate(flowType === 'class' ? '/wellness-guide-classes' : '/pilgrim-experiences')}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50"
            >
              {flowType === 'class' ? 'Browse Classes' : 'Continue Browsing'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentStatus; 