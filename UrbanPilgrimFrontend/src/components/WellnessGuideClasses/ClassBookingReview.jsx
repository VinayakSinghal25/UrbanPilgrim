// UrbanPilgrimFrontend/src/components/WellnessGuideClasses/ClassBookingReview.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { classBookingApi } from '../../api/classBookingApi';
import {
  ArrowLeftIcon,
  CalendarIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ClassBookingReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector((state) => state.auth);

  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  // Query params
  const classId = searchParams.get('classId');
  const slotIdsParam = searchParams.get('slotIds'); // JSON or comma
  const attendeeCount = parseInt(searchParams.get('attendeeCount') || '1');

  // Parse slotIds to array (string[])
  let slotIds = [];
  if (slotIdsParam) {
    try {
      slotIds = slotIdsParam.startsWith('[') ? JSON.parse(slotIdsParam) : slotIdsParam.split(',');
    } catch (e) {
      slotIds = [];
    }
  }

  useEffect(() => {
    // Authentication check
    if (!user || !token) {
      const curUrl = window.location.href;
      navigate(`/login?redirect=${encodeURIComponent(curUrl)}`);
      return;
    }

    if (!classId || slotIds.length === 0 || !attendeeCount) {
      setError('Missing booking parameters');
      setLoading(false);
      return;
    }

    fetchReview();
  }, [classId, slotIdsParam, attendeeCount, user, token]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await classBookingApi.getBookingReview(classId, slotIds, attendeeCount);
      setReviewData(data.data);
    } catch (err) {
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCreateBooking = async () => {
    if (!userConsent) {
      alert('Please accept the terms and conditions to proceed');
      return;
    }

    try {
      setIsBooking(true);

      const payload = {
        classId,
        slotIds,
        attendeeCount,
        userConsent: true,
      };

      const response = await classBookingApi.createBooking(payload);
      if (!response.success) throw new Error(response.message || 'Failed to create booking');

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Razorpay SDK failed to load');

      const { orderId, amount, bookingId } = response.data;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_NmETHEgStX3Xi7';

      const options = {
        key: razorpayKey,
        order_id: orderId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Urban Pilgrim',
        description: `Class Booking ${bookingId}`,
        notes: { bookingId, bookingType: 'wellness_class' },
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || '',
          email: user?.email || '',
          contact: user?.contactNumber || '',
        },
        theme: { color: '#059669' },
        handler: function (rzpRes) {
          navigate(
            `/class-payment/status?razorpay_order_id=${rzpRes.razorpay_order_id}&razorpay_payment_id=${rzpRes.razorpay_payment_id}&razorpay_signature=${rzpRes.razorpay_signature}`
          );
        },
        modal: {
          ondismiss: function () {
            navigate(
              `/class-payment/status?razorpay_order_id=${orderId}&error_code=USER_CANCELLED&error_description=${encodeURIComponent('Payment window closed by user')}`
            );
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (err) {
        const { order_id, code, description } = err.error || {};
        navigate(
          `/class-payment/status?razorpay_order_id=${order_id}&error_code=${code}&error_description=${encodeURIComponent(description || 'Payment failed')}`
        );
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  const formatDateTime = (slot) => {
    const dateStr = new Date(slot.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    return `${dateStr}, ${slot.startTime}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ArrowPathIcon className="h-10 w-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { class: classInfo, bookingDetails, pricing } = reviewData;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 mr-3">
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Review & Confirm</h1>
      </div>

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="md:col-span-2 space-y-6">
          {/* Class Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{classInfo.title}</h2>
            <p className="text-sm text-gray-600 mb-4">
              with {classInfo.wellnessGuide?.firstName || ''} {classInfo.wellnessGuide?.lastName || ''}
            </p>
            <div className="divide-y divide-gray-200">
              {bookingDetails.selectedSlots.map((slot) => (
                <div key={slot.slotId} className="flex items-center py-2">
                  <CalendarIcon className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-sm text-gray-800">{formatDateTime(slot)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* People Count */}
          <div className="bg-white rounded-lg shadow p-6 flex items-center">
            <UsersIcon className="h-5 w-5 text-emerald-600 mr-3" />
            <span className="text-sm text-gray-800">
              {bookingDetails.attendeeCount} {bookingDetails.attendeeCount > 1 ? 'people' : 'person'} attending
            </span>
          </div>

          {/* Consent */}
          <div className="bg-white rounded-lg shadow p-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded"
                checked={userConsent}
                onChange={(e) => setUserConsent(e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                I agree to the <span className="underline">terms & conditions</span> and the
                cancellation policy.
              </span>
            </label>
          </div>
        </div>

        {/* Pricing Sidebar */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4 h-max">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Details</h3>
          <div className="flex justify-between text-sm text-gray-700">
            <span>Subtotal</span>
            <span className="flex items-center"><CurrencyRupeeIcon className="h-4 w-4" />{pricing.baseAmount.toLocaleString()}</span>
          </div>
          {pricing.discounts.totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Discount</span>
              <span className="flex items-center">-<CurrencyRupeeIcon className="h-4 w-4" />{pricing.discounts.totalDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-700">
            <span>Taxes & Fees</span>
            <span className="flex items-center"><CurrencyRupeeIcon className="h-4 w-4" />{pricing.taxes.totalTax.toLocaleString()}</span>
          </div>
          <hr />
          <div className="flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span className="flex items-center"><CurrencyRupeeIcon className="h-5 w-5" />{pricing.totalAmount.toLocaleString()}</span>
          </div>

          <button
            disabled={isBooking}
            onClick={handleCreateBooking}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isBooking ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />Processing...
              </>
            ) : (
              'Pay & Confirm'
            )}
          </button>

          <div className="flex items-center text-xs text-gray-400 mt-2">
            <ShieldCheckIcon className="h-4 w-4 mr-1" /> Secure payment powered by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassBookingReview; 