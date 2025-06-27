import React from 'react';
import { 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  UserIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const WellnessGuideClassCard = ({ wellnessClass, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(wellnessClass._id);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `₹${price.toLocaleString()}`;
  };

  const getImageUrl = () => {
    if (wellnessClass.photos && wellnessClass.photos.length > 0) {
      return wellnessClass.photos[0];
    }
    return '/placeholder-wellness.jpg'; // You can add a placeholder image
  };

  const getGuideName = () => {
    if (wellnessClass.wellnessGuide?.user) {
      const { firstName, lastName } = wellnessClass.wellnessGuide.user;
      return `${firstName} ${lastName}`;
    }
    return 'Guide Name';
  };

  const getAvailableModes = () => {
    const modes = [];
    if (wellnessClass.modes?.online?.enabled) {
      modes.push({
        type: 'online',
        price: wellnessClass.modes.online.price,
        capacity: wellnessClass.modes.online.maxCapacity
      });
    }
    if (wellnessClass.modes?.offline?.enabled) {
      modes.push({
        type: 'offline',
        price: wellnessClass.modes.offline.price,
        capacity: wellnessClass.modes.offline.maxCapacity,
        location: wellnessClass.modes.offline.location
      });
    }
    return modes;
  };

  const getLowestPrice = () => {
    const modes = getAvailableModes();
    if (modes.length === 0) return 0;
    return Math.min(...modes.map(mode => mode.price || 0));
  };

  const modes = getAvailableModes();
  const lowestPrice = getLowestPrice();

  return (
    <div 
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-emerald-50 to-teal-50">
        <img
          src={getImageUrl()}
          alt={wellnessClass.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback when image fails to load */}
        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 text-emerald-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <p className="text-emerald-600 font-medium text-sm sm:text-base">Wellness Class</p>
          </div>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full">
            <div className="flex items-center space-x-1">
              <CurrencyRupeeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
              <span className="text-xs sm:text-sm font-semibold text-gray-900">
                {formatPrice(lowestPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Difficulty Badge */}
        {wellnessClass.difficulty && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1 rounded-full">
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {wellnessClass.difficulty}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors duration-200">
          {wellnessClass.title}
        </h3>

        {/* Guide Name */}
        <div className="flex items-center text-gray-600 mb-2 sm:mb-3">
          <UserIcon className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate">by {getGuideName()}</span>
        </div>

        {/* Specialty */}
        {wellnessClass.specialty && (
          <div className="flex items-center text-gray-600 mb-2 sm:mb-3">
            <TagIcon className="h-4 w-4 mr-2 text-emerald-500 flex-shrink-0" />
            <span className="text-sm truncate">{wellnessClass.specialty.name}</span>
          </div>
        )}

        {/* Available Modes */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-wrap gap-2">
            {modes.map((mode, index) => (
              <div key={index} className="flex items-center space-x-1">
                {mode.type === 'online' ? (
                  <GlobeAltIcon className="h-3 w-3 text-blue-500" />
                ) : (
                  <BuildingOfficeIcon className="h-3 w-3 text-orange-500" />
                )}
                <span className="text-xs text-gray-600 capitalize">{mode.type}</span>
                {mode.type === 'offline' && mode.location && (
                  <>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-600 truncate max-w-[80px]" title={mode.location}>
                      {mode.location}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {wellnessClass.description && (
          <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {wellnessClass.description}
          </p>
        )}

        {/* Languages */}
        {wellnessClass.wellnessGuide?.languages && wellnessClass.wellnessGuide.languages.length > 0 && (
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {wellnessClass.wellnessGuide.languages.slice(0, 2).map((language, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-200"
                >
                  {language}
                </span>
              ))}
              {wellnessClass.wellnessGuide.languages.length > 2 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                  +{wellnessClass.wellnessGuide.languages.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-base sm:text-lg font-bold text-emerald-600 truncate">
              {formatPrice(lowestPrice)}
            </p>
          </div>
          <button className="ml-3 px-3 py-2 sm:px-4 sm:py-2 bg-emerald-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors duration-200 group-hover:shadow-md flex-shrink-0">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default WellnessGuideClassCard; 