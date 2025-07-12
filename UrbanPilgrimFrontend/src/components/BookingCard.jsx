import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingCard = ({ booking }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        return 'bg-green-100 text-green-800';
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      case 'draft':
        return 'Draft';
      case 'in_progress':
        return 'In Progress';
      case 'refunded':
        return 'Refunded';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const getBookingTypeIcon = (bookingType) => {
    if (bookingType === 'pilgrim_experience') {
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    }
  };

  const getBookingDetails = () => {
    if (booking.bookingType === 'pilgrim_experience') {
      // Handle pilgrim experience data with better fallbacks
      const entity = booking.entity?.entityId;
      
      // Get title with multiple fallbacks
      const title = entity?.name || entity?.title || 'Pilgrim Experience';
      
      // Handle pilgrim experience images with robust checking
      let imageUrl = null;
      if (entity?.images && Array.isArray(entity.images) && entity.images.length > 0) {
        const firstImage = entity.images[0];
        if (typeof firstImage === 'object' && firstImage?.url) {
          imageUrl = firstImage.url;
        } else if (typeof firstImage === 'string') {
          imageUrl = firstImage;
        }
      }

      return {
        title,
        subtitle: `${booking.experienceDetails?.occupancyType === 'Couple' ? 'Twin' : booking.experienceDetails?.occupancyType || 'Unknown'} • ${booking.experienceDetails?.sessionCount || 0} session${(booking.experienceDetails?.sessionCount || 0) > 1 ? 's' : ''}`,
        dateInfo: booking.experienceDetails?.selectedDates ? 
          `${formatDate(booking.experienceDetails.selectedDates.from)} - ${formatDate(booking.experienceDetails.selectedDates.to)}` : 
          'Date not available',
        image: imageUrl
      };
    } else {
      // Handle wellness class data with better fallbacks
      const entity = booking.entity?.entityId;
      
      // Get title with multiple fallbacks
      const title = entity?.title || entity?.name || 'Wellness Class';
      
      // Handle wellness class images with robust checking
      let imageUrl = null;
      if (entity?.photos && Array.isArray(entity.photos) && entity.photos.length > 0) {
        const firstPhoto = entity.photos[0];
        if (typeof firstPhoto === 'object' && firstPhoto?.url) {
          imageUrl = firstPhoto.url;
        } else if (typeof firstPhoto === 'string') {
          imageUrl = firstPhoto;
        }
      }

      const firstSlot = booking.classDetails?.selectedSlots?.[0];
      return {
        title,
        subtitle: `${booking.classDetails?.attendeeCount || 0} attendee${(booking.classDetails?.attendeeCount || 0) > 1 ? 's' : ''} • ${booking.classDetails?.classCount || 0} class${(booking.classDetails?.classCount || 0) > 1 ? 'es' : ''}`,
        dateInfo: firstSlot ? 
          `${formatDate(firstSlot.date)} at ${formatTime(firstSlot.startTime)}` : 
          'Date not available',
        image: imageUrl
      };
    }
  };

  const bookingDetails = getBookingDetails();

  const handleCardClick = () => {
    navigate(`/booking-details/${booking.bookingId}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          {/* Left Section - Main Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Image */}
            <div className="flex-shrink-0">
              {bookingDetails.image ? (
                <img
                  src={bookingDetails.image}
                  alt={bookingDetails.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center"
                style={{display: bookingDetails.image ? 'none' : 'flex'}}
              >
                {getBookingTypeIcon(booking.bookingType)}
              </div>
            </div>

            {/* Booking Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getBookingTypeIcon(booking.bookingType)}
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {bookingDetails.title}
                </h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">
                {bookingDetails.subtitle}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{bookingDetails.dateInfo}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{booking.bookingId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Status & Price */}
          <div className="flex-shrink-0 text-right ml-4">
            <div className="flex flex-col items-end space-y-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
              
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">
                  ₹{booking.pricing.totalAmount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Booked on {formatDate(booking.createdAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-friendly bottom section */}
        <div className="mt-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {bookingDetails.dateInfo}
            </div>
            <div className="text-sm text-gray-500">
              {booking.bookingId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard; 