// UrbanPilgrimFrontend/src/components/WellnessGuideClasses/ClassPaymentStatus.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { classBookingApi } from '../../api/classBookingApi';

const ClassPaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [timeLeft, setTimeLeft] = useState(300);
  const [isRetrying, setIsRetrying] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);

  const razorpayOrderId = searchParams.get('razorpay_order_id');
  const razorpayPaymentId = searchParams.get('razorpay_payment_id');
  const razorpaySignature = searchParams.get('razorpay_signature');
  const errorCode = searchParams.get('error_code');
  const errorDescription = searchParams.get('error_description');

  useEffect(() => {
    if (razorpayPaymentId && razorpaySignature) {
      handlePaymentSuccess();
    } else if (errorCode) {
      handlePaymentFailure();
    } else {
      setPaymentStatus('processing');
      startTimer();
    }
  }, [razorpayPaymentId, razorpaySignature, errorCode]);

  const startTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePaymentSuccess = async () => {
    try {
      setPaymentStatus('processing');
      const res = await classBookingApi.handlePaymentCallback({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
      });
      if (res.success) {
        setPaymentStatus('success');
        setBookingDetails(res.data);
      } else {
        setPaymentStatus('failed');
        setError(res.message || 'Payment verification failed');
      }
    } catch (err) {
      setPaymentStatus('failed');
      setError(err.message || 'Payment processing failed');
    }
  };

  const handlePaymentFailure = async () => {
    setPaymentStatus('failed');
    setError(errorDescription || 'Payment failed');
    try {
      await classBookingApi.handlePaymentFailure({
        razorpay_order_id: razorpayOrderId,
        error_code: errorCode,
        error_description: errorDescription,
      });
    } catch (_) {}
  };

  const retryPaymentCheck = () => {
    setIsRetrying(true);
    setTimeLeft(300);
    startTimer();
    setIsRetrying(false);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleMyBookings = () => navigate('/profile');

  // --- UI STATES (reuse structure) ---
  const Wrapper = ({ icon, title, children }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">{icon}{title}</div>
        {children}
      </div>
    </div>
  );

  if (paymentStatus === 'processing') {
    return (
      <Wrapper
        icon={<div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"><ArrowPathIcon className="h-8 w-8 text-blue-600 animate-spin" /></div>}
        title={<>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </>}
      >
        <div className="bg-amber-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2"><ClockIcon className="h-5 w-5 text-amber-600 mr-2" /><span className="text-sm font-medium text-amber-800">Waiting for confirmation</span></div>
          <div className="text-2xl font-bold text-amber-900">{formatTime(timeLeft)}</div>
        </div>
      </Wrapper>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <Wrapper
        icon={<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircleIcon className="h-8 w-8 text-green-600" /></div>}
        title={<>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your class booking has been confirmed successfully.</p>
        </>}
      >
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
          <button onClick={handleMyBookings} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 mb-3 flex items-center justify-center"><DocumentTextIcon className="h-5 w-5 mr-2" /> View My Bookings</button>
          <button onClick={() => navigate('/wellness-guide-classes')} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">Browse Classes</button>
        </div>
      </Wrapper>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <Wrapper
        icon={<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"><XCircleIcon className="h-8 w-8 text-red-600" /></div>}
        title={<>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600">We couldn't process your payment. Please try again.</p>
        </>}
      >
        {error && <div className="bg-red-50 rounded-lg p-4 mb-6"><p className="text-sm text-red-800">{error}</p></div>}
        <div className="space-y-3">
          <button onClick={() => navigate(-1)} className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-medium">Try Again</button>
          <button onClick={() => navigate('/wellness-guide-classes')} className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50">Browse Classes</button>
        </div>
      </Wrapper>
    );
  }

  // timeout / others reuse processing UI with retry option
  return (
    <Wrapper icon={<ClockIcon className="h-8 w-8 text-orange-600" />} title={<h2 className="text-xl font-bold">Waiting…</h2>}>
      <button onClick={retryPaymentCheck} className="mt-4 bg-orange-600 text-white px-4 py-2 rounded">Check Again</button>
    </Wrapper>
  );
};

export default ClassPaymentStatus; 