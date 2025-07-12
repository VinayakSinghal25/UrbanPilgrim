import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingDetails } from '../api/userApi';
import { getTokenFromCookie } from '../utils/cookies';

const BookingDetailsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token from localStorage or cookies
      let token = localStorage.getItem('token');
      if (!token) {
        token = getTokenFromCookie();
      }

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await getBookingDetails(token, bookingId);

      if (response.success) {
        setBooking(response.data);
      } else {
        setError('Failed to load booking details');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'payment_failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'payment_pending':
        return 'Payment Pending';
      case 'payment_failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'Unable to load booking details'}</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            View All Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/my-bookings')}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Booking Details
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {booking.bookingId}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <div className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Experience/Class Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {booking.bookingType === 'pilgrim_experience' ? 'Experience Details' : 'Class Details'}
              </h2>
              
              <div className="flex items-start space-x-4">
                {/* Image */}
                <div className="flex-shrink-0">
                  {(() => {
                    // Handle different image structures for experiences vs classes with robust checking
                    let imageUrl = null;
                    const entity = booking.entity?.entityId;
                    
                    if (booking.bookingType === 'pilgrim_experience') {
                      // For pilgrim experiences - images array
                      if (entity?.images && Array.isArray(entity.images) && entity.images.length > 0) {
                        const firstImage = entity.images[0];
                        if (typeof firstImage === 'object' && firstImage?.url) {
                          imageUrl = firstImage.url;
                        } else if (typeof firstImage === 'string') {
                          imageUrl = firstImage;
                        }
                      }
                    } else {
                      // For wellness classes - photos array
                      if (entity?.photos && Array.isArray(entity.photos) && entity.photos.length > 0) {
                        const firstPhoto = entity.photos[0];
                        if (typeof firstPhoto === 'object' && firstPhoto?.url) {
                          imageUrl = firstPhoto.url;
                        } else if (typeof firstPhoto === 'string') {
                          imageUrl = firstPhoto;
                        }
                      }
                    }

                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={entity?.name || entity?.title || 'Booking'}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null;
                  })()}
                  
                  <div 
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-lg flex items-center justify-center"
                    style={{display: (() => {
                      const entity = booking.entity?.entityId;
                      let hasImage = false;
                      
                      if (booking.bookingType === 'pilgrim_experience') {
                        hasImage = entity?.images && Array.isArray(entity.images) && entity.images.length > 0;
                      } else {
                        hasImage = entity?.photos && Array.isArray(entity.photos) && entity.photos.length > 0;
                      }
                      
                      return hasImage ? 'none' : 'flex';
                    })()}}
                  >
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Experience/Class Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {(() => {
                      const entity = booking.entity?.entityId;
                      return entity?.name || entity?.title || (booking.bookingType === 'pilgrim_experience' ? 'Pilgrim Experience' : 'Wellness Class');
                    })()}
                  </h3>
                  
                  {booking.bookingType === 'pilgrim_experience' ? (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {formatDate(booking.bookingDetails.selectedDates.from)} - {formatDate(booking.bookingDetails.selectedDates.to)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {booking.bookingDetails.occupancyType === 'Couple' ? 'Twin' : booking.bookingDetails.occupancyType} • {booking.bookingDetails.sessionCount} session{booking.bookingDetails.sessionCount > 1 ? 's' : ''} • {booking.bookingDetails.totalGuestCount} guest{booking.bookingDetails.totalGuestCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      {booking.entity.entityId?.location && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{booking.entity.entityId.location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {booking.bookingDetails.attendeeCount} attendee{booking.bookingDetails.attendeeCount > 1 ? 's' : ''} • {booking.bookingDetails.classCount} class{booking.bookingDetails.classCount > 1 ? 'es' : ''}
                        </span>
                      </div>
                      
                      {/* Class Schedule */}
                      <div className="mt-3">
                        <h4 className="font-medium text-gray-900 mb-2">Class Schedule:</h4>
                        <div className="space-y-2">
                          {booking.bookingDetails.selectedSlots.map((slot, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {formatDate(slot.date)} at {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                slot.mode === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {slot.mode}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-sm text-gray-900">{booking.customerInfo.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-sm text-gray-900">{booking.customerInfo.email}</p>
                </div>
                {booking.customerInfo.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-sm text-gray-900">{booking.customerInfo.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment ID</label>
                    <p className="text-sm text-gray-900 font-mono">
                      {booking.payment.razorpay.paymentId || 'Not available'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <p className="text-sm text-gray-900">{booking.payment.status}</p>
                  </div>
                  {booking.payment.paidAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paid At</label>
                      <p className="text-sm text-gray-900">{formatDate(booking.payment.paidAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Base Amount</span>
                  <span className="text-sm text-gray-900">₹{booking.pricing.baseAmount.toLocaleString()}</span>
                </div>
                
                {booking.pricing.discounts?.totalDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm text-green-600">-₹{booking.pricing.discounts.totalDiscount.toLocaleString()}</span>
                  </div>
                )}
                
                {booking.pricing.taxes?.totalTax > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxes</span>
                    <span className="text-sm text-gray-900">₹{booking.pricing.taxes.totalTax.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">₹{booking.pricing.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Booking Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="text-gray-900 font-mono">{booking.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="text-gray-900">{formatDate(booking.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage; 