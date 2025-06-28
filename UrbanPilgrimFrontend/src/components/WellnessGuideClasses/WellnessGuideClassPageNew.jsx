import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../../api/WellnessGuideClassApi';

const WellnessGuideClassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState('online');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchClassDetails();
    }
  }, [id]);

  useEffect(() => {
    if (classDetails) {
      if (classDetails.modes.online?.enabled && !classDetails.modes.offline?.enabled) {
        setSelectedMode('online');
      } else if (!classDetails.modes.online?.enabled && classDetails.modes.offline?.enabled) {
        setSelectedMode('offline');
      }
    }
  }, [classDetails]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const data = await getClassDetails(id);
      setClassDetails(data.classDetails);
      setTimeSlots(data.timeSlots);
    } catch (err) {
      setError('Failed to load class details');
      console.error('Error fetching class details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDiscountText = (discount) => {
    if (!discount.isEnabled || !discount.tiers || discount.tiers.length === 0) {
      return null;
    }
    
    const minTier = discount.tiers.reduce((min, tier) => 
      tier.minClasses < min.minClasses ? tier : min
    );
    
    return `Get up to ${Math.max(...discount.tiers.map(t => t.discountPercentage))}% off when you book ${minTier.minClasses}+ sessions`;
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  const getCurrentPrice = () => {
    if (selectedMode === 'online') {
      return classDetails.modes.online?.price || 0;
    } else {
      return classDetails.modes.offline?.price || 0;
    }
  };

  const goToNextImage = () => {
    if (classDetails?.photos?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % classDetails.photos.length);
    }
  };

  const goToPrevImage = () => {
    if (classDetails?.photos?.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + classDetails.photos.length) % classDetails.photos.length);
    }
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  const handleSlotSelection = (slots) => {
    setSelectedSlots(slots);
  };

  const handlePeopleChange = (count) => {
    setNumberOfPeople(count);
  };

  const calculateBookingTotal = () => {
    const basePrice = getCurrentPrice();
    const totalSlots = selectedSlots.length;
    const subtotal = basePrice * totalSlots * numberOfPeople;
    
    const discountConfig = selectedMode === 'online' 
      ? classDetails?.adminSettings?.onlineDiscount 
      : classDetails?.adminSettings?.offlineDiscount;

    let discount = null;
    let discountAmount = 0;
    
    if (discountConfig?.isEnabled && totalSlots > 0) {
      const applicableTier = discountConfig.tiers
        .filter(tier => totalSlots >= tier.minClasses)
        .sort((a, b) => b.discountPercentage - a.discountPercentage)[0];
      
      if (applicableTier) {
        discountAmount = (subtotal * applicableTier.discountPercentage) / 100;
        discount = {
          discountPercentage: applicableTier.discountPercentage,
          discountAmount
        };
      }
    }

    return {
      subtotal,
      discount,
      total: subtotal - discountAmount
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error || 'Class not found'}</p>
          <button 
            onClick={() => navigate('/wellness-guide-classes')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Back to Classes
          </button>
        </div>
      </div>
    );
  }

  const bookingTotal = calculateBookingTotal();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container for entire content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Class Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            {classDetails.title}
          </h1>
        </div>

        {/* Centered Image Card */}
        {classDetails.photos && classDetails.photos.length > 0 && (
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl w-full">
              {/* Image Container - Centered */}
              <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden">
                <img
                  src={classDetails.photos[currentImageIndex]}
                  alt={`${classDetails.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                
                {/* Navigation Arrows */}
                {classDetails.photos.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevImage}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 sm:p-2 shadow-lg transition-all duration-200"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1 sm:p-2 shadow-lg transition-all duration-200"
                    >
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
                
                {/* Image Counter */}
                {classDetails.photos.length > 1 && (
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-60 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {currentImageIndex + 1} / {classDetails.photos.length}
                  </div>
                )}
              </div>
              
              {/* Dot Indicators */}
              {classDetails.photos.length > 1 && (
                <div className="flex justify-center space-x-2 py-3 sm:py-4 bg-gray-50">
                  {classDetails.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-emerald-600 scale-110' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* About Your Guide */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">About Your Guide</h2>
              
              {/* Mobile Layout */}
              <div className="block sm:hidden text-center">
                {classDetails.wellnessGuide?.profilePictures?.[0] && (
                  <img
                    src={classDetails.wellnessGuide.profilePictures[0].url}
                    alt={`${classDetails.wellnessGuide.user?.firstName} ${classDetails.wellnessGuide.user?.lastName}`}
                    className="w-20 sm:w-24 h-20 sm:h-24 rounded-full object-cover mx-auto mb-3 sm:mb-4"
                  />
                )}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {classDetails.wellnessGuide?.user?.firstName} {classDetails.wellnessGuide?.user?.lastName}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {classDetails.wellnessGuide?.profileDescription}
                </p>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:flex items-start space-x-4 sm:space-x-6">
                {classDetails.wellnessGuide?.profilePictures?.[0] && (
                  <img
                    src={classDetails.wellnessGuide.profilePictures[0].url}
                    alt={`${classDetails.wellnessGuide.user?.firstName} ${classDetails.wellnessGuide.user?.lastName}`}
                    className="w-24 sm:w-32 h-24 sm:h-32 rounded-full object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {classDetails.wellnessGuide?.user?.firstName} {classDetails.wellnessGuide?.user?.lastName}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {classDetails.wellnessGuide?.profileDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Class Description */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">About This Class</h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                {classDetails.description}
              </p>
            </div>

            {/* Skills Section */}
            {classDetails.skillsToLearn && classDetails.skillsToLearn.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">What You'll Learn</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {classDetails.skillsToLearn.map((skill, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-600 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {classDetails.guideCertifications && classDetails.guideCertifications.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Guide Certifications</h2>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {classDetails.guideCertifications.map((cert, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* About Sections - Only render if not empty */}
            {classDetails.aboutSections && classDetails.aboutSections.length > 0 && classDetails.aboutSections.some(section => section.header || section.paragraph) && (
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">More Details</h2>
                <div className="space-y-4 sm:space-y-6">
                  {classDetails.aboutSections.map((section, index) => (
                    <div key={index}>
                      {section.header && (
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                          {section.header}
                        </h3>
                      )}
                      {section.paragraph && (
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {section.paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 sm:top-6">
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                
                {/* Mode Selection */}
                {classDetails.modes.online?.enabled && classDetails.modes.offline?.enabled ? (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Choose Mode</h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      <button
                        onClick={() => handleModeSelect('online')}
                        className={`p-3 sm:p-4 rounded-xl font-medium transition-all duration-200 ${
                          selectedMode === 'online'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2 sm:mr-3">💻</span>
                            <span className="text-sm sm:text-base">Online</span>
                          </div>
                          <span className="text-sm sm:text-base font-bold">₹{classDetails.modes.online.price}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleModeSelect('offline')}
                        className={`p-3 sm:p-4 rounded-xl font-medium transition-all duration-200 ${
                          selectedMode === 'offline'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="mr-2 sm:mr-3">📍</span>
                            <span className="text-sm sm:text-base">Offline</span>
                          </div>
                          <span className="text-sm sm:text-base font-bold">₹{classDetails.modes.offline.price}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 sm:mb-6">
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2 sm:mr-3">
                            {classDetails.modes.online?.enabled ? '💻' : '📍'}
                          </span>
                          <span className="text-sm sm:text-base font-medium text-gray-900">
                            {classDetails.modes.online?.enabled ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <span className="text-sm sm:text-base font-bold text-gray-900">
                          ₹{getCurrentPrice()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Discount Information */}
                {(() => {
                  const discountConfig = selectedMode === 'online' 
                    ? classDetails.adminSettings?.onlineDiscount 
                    : classDetails.adminSettings?.offlineDiscount;
                  const discountText = formatDiscountText(discountConfig);
                  
                  if (discountText) {
                    return (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-start">
                          <svg className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-xs sm:text-sm text-green-800 font-medium">
                            {discountText}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Schedule Button */}
                <button 
                  onClick={() => navigate(`/wellness-guide-classes/${id}/book`)}
                  className="w-full bg-emerald-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Schedule Your Classes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessGuideClassPage; 