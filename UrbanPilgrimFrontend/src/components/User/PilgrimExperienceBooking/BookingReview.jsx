// src/components/User/PilgrimExperienceBooking/BookingReview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { bookingApi } from '../../../api/bookingApi';

const BookingReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector((state) => state.auth);
  
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [userConsent, setUserConsent] = useState(false);

  // Get URL parameters
  const experienceId = searchParams.get('experienceId');
  const occupancy = searchParams.get('occupancy');
  const sessionCount = searchParams.get('sessionCount');
  const selectedDates = searchParams.get('selectedDates');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user || !token) {
      const currentUrl = window.location.href;
      navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
      return;
    }

    // Validate required parameters
    if (!experienceId || !occupancy || !sessionCount || !selectedDates) {
      setError('Missing booking parameters');
      setLoading(false);
      return;
    }

    fetchBookingReview();
  }, [experienceId, occupancy, sessionCount, selectedDates, user, token]);

  const fetchBookingReview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const parsedDates = JSON.parse(selectedDates);
      const data = await bookingApi.getBookingReview(
        experienceId,
        occupancy,
        parseInt(sessionCount),
        parsedDates
      );
      
      setBookingData(data.data);
    } catch (err) {
      setError(err.message || 'Failed to load booking details');
      console.error('Error fetching booking review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!userConsent) {
      alert('Please accept the terms and conditions to proceed');
      return;
    }

    try {
      setIsBooking(true);
      
      const bookingPayload = {
        experienceId,
        occupancy,
        sessionCount: parseInt(sessionCount),
        selectedDates: JSON.parse(selectedDates),
        userConsent: true
      };

      const response = await bookingApi.createBooking(bookingPayload);
      
      if (response.success && response.data.paymentUrl) {
        // Redirect to payment
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking');
      console.error('Error creating booking:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Booking</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={fetchBookingReview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No booking data found</h3>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Go Back
          </button>
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
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Review Booking</h1>
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
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Go Back
            </button>
            {/* Header */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">REVIEW BOOKING</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{bookingData.experience.name}</h1>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {bookingData.experience.location}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
              <h2 className="text-lg font-semibold text-amber-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-gray-700">
                    {formatDate(bookingData.bookingDetails.selectedDates.from)} - {formatDate(bookingData.bookingDetails.selectedDates.to)}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <UsersIcon className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-gray-700">
                    {bookingData.bookingDetails.occupancy} Occupancy • {bookingData.bookingDetails.sessionCount} {bookingData.bookingDetails.sessionCount === 1 ? 'Session' : 'Sessions'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <InformationCircleIcon className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-gray-700">
                    Total People: {bookingData.bookingDetails.totalPeople}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-medium">{formatPrice(bookingData.pricing.baseAmount)}</span>
                </div>
                
                {bookingData.pricing.discounts.totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Discount Applied</span>
                    <span className="font-medium">-{formatPrice(bookingData.pricing.discounts.totalDiscount)}</span>
                  </div>
                )}
                
                {bookingData.pricing.taxes.totalTax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taxes</span>
                    <span className="font-medium">{formatPrice(bookingData.pricing.taxes.totalTax)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-amber-600">{formatPrice(bookingData.pricing.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Included */}
            {bookingData.whatsIncluded && bookingData.whatsIncluded.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {bookingData.whatsIncluded.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-green-800 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userConsent}
                      onChange={(e) => setUserConsent(e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the terms and conditions, cancellation policy, and privacy policy. 
                      I understand the booking is subject to availability and confirmation.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleCreateBooking}
                disabled={!userConsent || isBooking}
                className="w-full max-w-md px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="px-4 py-6 space-y-6">
          {/* Experience Header */}
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{bookingData.experience.name}</h1>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {bookingData.experience.location}
            </div>
          </div>



          {/* Booking Summary */}
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h2 className="text-lg font-semibold text-amber-900 mb-3">Booking Summary</h2>
            
            <div className="space-y-3">
              <div className="flex items-start text-sm">
                <CalendarIcon className="h-4 w-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  {formatDate(bookingData.bookingDetails.selectedDates.from)} - {formatDate(bookingData.bookingDetails.selectedDates.to)}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <UsersIcon className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-gray-700">
                  {bookingData.bookingDetails.occupancy} Occupancy • {bookingData.bookingDetails.sessionCount} {bookingData.bookingDetails.sessionCount === 1 ? 'Session' : 'Sessions'}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <InformationCircleIcon className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-gray-700">
                  Total People: {bookingData.bookingDetails.totalPeople}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Amount</span>
                <span className="font-medium">{formatPrice(bookingData.pricing.baseAmount)}</span>
              </div>
              
              {bookingData.pricing.discounts.totalDiscount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount Applied</span>
                  <span className="font-medium">-{formatPrice(bookingData.pricing.discounts.totalDiscount)}</span>
                </div>
              )}
              
              {bookingData.pricing.taxes.totalTax > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Taxes</span>
                  <span className="font-medium">{formatPrice(bookingData.pricing.taxes.totalTax)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-amber-600">{formatPrice(bookingData.pricing.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* What's Included */}
          {bookingData.whatsIncluded && bookingData.whatsIncluded.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3">What's Included</h3>
              <ul className="space-y-2">
                {bookingData.whatsIncluded.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-green-800 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userConsent}
                    onChange={(e) => setUserConsent(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the terms and conditions, cancellation policy, and privacy policy. 
                    I understand the booking is subject to availability and confirmation.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pb-6">
            <button
              onClick={handleCreateBooking}
              disabled={!userConsent || isBooking}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {isBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;