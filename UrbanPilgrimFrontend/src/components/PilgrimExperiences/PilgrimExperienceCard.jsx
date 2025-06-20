// src/components/PilgrimExperiences/PilgrimExperienceCard.jsx
import React from 'react';
import { MapPinIcon, CurrencyRupeeIcon, CalendarIcon } from '@heroicons/react/24/outline';

const PilgrimExperienceCard = ({ experience, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(experience._id);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `₹${price.toLocaleString()}`;
  };

  const getImageUrl = () => {
    if (experience.images && experience.images.length > 0) {
      return experience.images[0].url;
    }
    return '/placeholder-retreat.jpg'; // You can add a placeholder image
  };

  const getAvailableDatesText = () => {
    if (!experience.availableDates || experience.availableDates.length === 0) {
      return 'Dates to be announced';
    }
    
    const nextDate = experience.availableDates.find(date => new Date(date.from) > new Date());
    if (nextDate) {
      const fromDate = new Date(nextDate.from).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      const toDate = new Date(nextDate.to).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return `${fromDate} - ${toDate}`;
    }
    
    return `${experience.availableDates.length} date${experience.availableDates.length > 1 ? 's' : ''} available`;
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-amber-50 to-orange-50">
        <img
          src={getImageUrl()}
          alt={experience.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback when image fails to load */}
        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 text-amber-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <p className="text-amber-600 font-medium text-sm sm:text-base">Spiritual Journey</p>
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full">
            <div className="flex items-center space-x-1">
              <CurrencyRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {formatPrice(experience.price)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors duration-200">
          {experience.name}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-2 sm:mb-3">
          <MapPinIcon className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate">{experience.location}</span>
        </div>

        {/* Dates */}
        <div className="flex items-center text-gray-600 mb-3 sm:mb-4">
          <CalendarIcon className="h-4 w-4 mr-2 text-amber-500 flex-shrink-0" />
          <span className="text-sm truncate">{getAvailableDatesText()}</span>
        </div>

        {/* Description */}
        {experience.whatToExpect && (
          <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {experience.whatToExpect}
          </p>
        )}

        {/* What's Included Preview */}
        {experience.whatsIncluded && experience.whatsIncluded.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {experience.whatsIncluded.slice(0, 2).map((item, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200 truncate max-w-[120px] sm:max-w-none"
                  title={item}
                >
                  {item.length > 15 ? `${item.substring(0, 15)}...` : item}
                </span>
              ))}
              {experience.whatsIncluded.length > 2 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                  +{experience.whatsIncluded.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-base sm:text-lg font-bold text-amber-600 truncate">
              {formatPrice(experience.price)}
            </p>
          </div>
          <button className="ml-3 px-3 py-2 sm:px-4 sm:py-2 bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors duration-200 group-hover:shadow-md flex-shrink-0">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PilgrimExperienceCard;