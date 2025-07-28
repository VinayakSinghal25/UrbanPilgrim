import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeftIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  UsersIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { getClassDetails, getAllApprovedClasses } from '../../../../api/WellnessGuideClassApi';

const WellnessGuideClassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  
  // Add CSS for hiding scrollbar
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  const [classDetails, setClassDetails] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState('online');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    aboutGuide: false,
    skillsToLearn: false,
    certifications: false
  });

  // See More Classes State
  const [seeMoreClasses, setSeeMoreClasses] = useState([]);
  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const [seeMoreError, setSeeMoreError] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
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

  // Fetch 4 more classes for 'See More' section
  const fetchSeeMoreClasses = useCallback(async () => {
    setSeeMoreLoading(true);
    setSeeMoreError(null);
    try {
      // Fetch a list, filter out current class
      const data = await getAllApprovedClasses({ limit: 8 });
      let filtered = data.classes.filter(c => c._id !== id);
      
      // Take first 4 classes
      setSeeMoreClasses(filtered.slice(0, 4));
    } catch (err) {
      setSeeMoreError('Failed to load more classes');
      console.error('Error fetching more classes:', err);
    } finally {
      setSeeMoreLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (classDetails) {
      fetchSeeMoreClasses();
    }
  }, [classDetails, fetchSeeMoreClasses]);

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

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `Rs. ${price.toLocaleString()}.00/session`;
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

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const toggleSectionExpansion = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBookNow = () => {
    if (!user || !token) {
      const bookingUrl = `/class-booking/${id}`;
      navigate(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
      return;
    }
    
    // Navigate to the existing class booking page where users can select slots
    navigate(`/class-booking/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !classDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Class</h3>
            <p className="text-red-600 mb-4">{error || 'Class not found'}</p>
            <div className="space-x-4">
              <button 
                onClick={fetchClassDetails}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/wellness-guide-classes')}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                Back to Classes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Only Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate('/wellness-guide-classes')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {formatPrice(getCurrentPrice())}
              </p>
              <p className="text-xs text-gray-400">
                {selectedMode === 'online' ? 'Online' : 'Offline'} Mode
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">WELLNESS GUIDE</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {classDetails.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Side - Fixed Image */}
        <div className="w-1/2 flex flex-col items-center justify-start pt-8 pb-8 bg-white sticky top-0 h-screen relative">
          <div className="w-[96%] max-w-[640px] aspect-square rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            {classDetails.photos && classDetails.photos.length > 0 ? (
              <img
                src={classDetails.photos[currentImageIndex]}
                alt={classDetails.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-600 font-medium">Wellness Class</p>
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails under main image */}
          {classDetails.photos && classDetails.photos.length > 1 && (
            <div className="flex gap-2 mt-4 justify-center w-[90%] max-w-[520px] flex-wrap">
              {classDetails.photos.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`thumb-${idx}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-14 h-14 object-cover rounded-lg border cursor-pointer transition-all flex-shrink-0 ${idx === currentImageIndex ? 'border-black ring-2 ring-black' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          )}
          {/* Back Button */}
          <button
            onClick={() => navigate('/wellness-guide-classes')}
            className="absolute top-8 left-8 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Right Side - All Content */}
        <div 
          className="w-1/2 bg-white flex flex-col justify-between overflow-y-auto hide-scrollbar"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="p-8 pt-12 space-y-8 flex-1">
            {/* Header */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">WELLNESS GUIDE</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{classDetails.title}</h1>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(getCurrentPrice())}
                </p>
                <span className="text-sm text-gray-500">
                  ({selectedMode === 'online' ? 'Online' : 'Offline'} Mode)
                </span>
              </div>
            </div>

            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Class Mode</label>
              <div className="flex space-x-2">
                {classDetails.modes.online?.enabled && (
                  <button
                    onClick={() => handleModeSelect('online')}
                    className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                      selectedMode === 'online' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Online
                    <div className="text-xs mt-1">
                      ₹{classDetails.modes.online.price?.toLocaleString()}/session
                    </div>
                  </button>
                )}
                {classDetails.modes.offline?.enabled && (
                  <button
                    onClick={() => handleModeSelect('offline')}
                    className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                      selectedMode === 'offline' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Offline
                    <div className="text-xs mt-1">
                      ₹{classDetails.modes.offline.price?.toLocaleString()}/session
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Location Information */}
            {selectedMode === 'offline' && classDetails.modes.offline?.location && (
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{classDetails.modes.offline.location}</span>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                No of sessions ({quantity} in cart)
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => handleQuantityChange(-1)} 
                  className="p-3 hover:bg-gray-50 border-r border-gray-300"
                  disabled={quantity <= 1}
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="flex-1 text-center py-3 font-medium">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)} 
                  className="p-3 hover:bg-gray-50 border-l border-gray-300"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Book Now Button */}
            <button 
              onClick={handleBookNow}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Book Now
            </button>

            {/* About Your Guide */}
            {classDetails.wellnessGuide && (
              <div className="border border-gray-200 rounded-lg">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50" 
                  onClick={() => toggleSectionExpansion('aboutGuide')}
                >
                  <h2 className="text-lg font-semibold text-gray-900">About your wellness guide</h2>
                  {expandedSections.aboutGuide ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.aboutGuide && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    <div className="flex items-start space-x-4">
                      {classDetails.wellnessGuide.profilePictures?.[0] && (
                        <img
                          src={classDetails.wellnessGuide.profilePictures[0].url}
                          alt={`${classDetails.wellnessGuide.user?.firstName} ${classDetails.wellnessGuide.user?.lastName}`}
                          className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {classDetails.wellnessGuide.user?.firstName} {classDetails.wellnessGuide.user?.lastName}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {classDetails.wellnessGuide.profileDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* What You'll Learn */}
            {classDetails.skillsToLearn && classDetails.skillsToLearn.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50" 
                  onClick={() => toggleSectionExpansion('skillsToLearn')}
                >
                  <h2 className="text-lg font-semibold text-gray-900">What you'll learn</h2>
                  {expandedSections.skillsToLearn ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.skillsToLearn && (
                  <div className="border-t border-gray-200 p-4">
                    <ul className="space-y-2">
                      {classDetails.skillsToLearn.map((skill, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span className="text-gray-600">{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Class Description */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">About This Class</h2>
              <p className="text-gray-600 leading-relaxed">{classDetails.description}</p>
            </div>

            {/* Certifications */}
            {classDetails.guideCertifications && classDetails.guideCertifications.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50" 
                  onClick={() => toggleSectionExpansion('certifications')}
                >
                  <h2 className="text-lg font-semibold text-gray-900">Guide certifications</h2>
                  {expandedSections.certifications ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {expandedSections.certifications && (
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex flex-wrap gap-2">
                      {classDetails.guideCertifications.map((cert, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* About Sections */}
            {classDetails.aboutSections && classDetails.aboutSections.length > 0 && classDetails.aboutSections.some(section => section.header || section.paragraph) && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">More Details</h2>
                <div className="space-y-4">
                  {classDetails.aboutSections.map((section, index) => (
                    <div key={index}>
                      {section.header && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {section.header}
                        </h3>
                      )}
                      {section.paragraph && (
                        <p className="text-gray-600 leading-relaxed">
                          {section.paragraph}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden px-4 py-6 space-y-6">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            {classDetails.photos && classDetails.photos.length > 0 ? (
              <img 
                src={classDetails.photos[currentImageIndex]} 
                alt={classDetails.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-emerald-50 to-teal-50">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-600 font-medium">Wellness Class</p>
                </div>
              </div>
            )}
          </div>
          {/* Image Navigation */}
          {classDetails.photos && classDetails.photos.length > 1 && (
            <>
              <button 
                onClick={goToPrevImage} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={goToNextImage} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {currentImageIndex + 1}/{classDetails.photos.length}
              </div>
            </>
          )}
        </div>

        {/* All Mobile Content - Same as Desktop Right Side */}
        <div className="space-y-6">
          {/* Price Display */}
          <div className="text-center">
            <div className="flex items-baseline justify-center space-x-2">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(getCurrentPrice())}
              </p>
              <span className="text-sm text-gray-500">
                ({selectedMode === 'online' ? 'Online' : 'Offline'} Mode)
              </span>
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Class Mode</label>
            <div className="flex space-x-2">
              {classDetails.modes.online?.enabled && (
                <button
                  onClick={() => handleModeSelect('online')}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                    selectedMode === 'online' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Online
                  <div className="text-xs mt-1">
                    ₹{classDetails.modes.online.price?.toLocaleString()}/session
                  </div>
                </button>
              )}
              {classDetails.modes.offline?.enabled && (
                <button
                  onClick={() => handleModeSelect('offline')}
                  className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                    selectedMode === 'offline' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Offline
                  <div className="text-xs mt-1">
                    ₹{classDetails.modes.offline.price?.toLocaleString()}/session
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Location Information */}
          {selectedMode === 'offline' && classDetails.modes.offline?.location && (
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{classDetails.modes.offline.location}</span>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              No of sessions ({quantity} in cart)
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={() => handleQuantityChange(-1)} 
                className="p-3 hover:bg-gray-50 border-r border-gray-300"
                disabled={quantity <= 1}
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="flex-1 text-center py-3 font-medium">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)} 
                className="p-3 hover:bg-gray-50 border-l border-gray-300"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Book Now Button */}
          <button 
            onClick={handleBookNow}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Book Now
          </button>

          {/* About Your Guide */}
          {classDetails.wellnessGuide && (
            <div className="border border-gray-200 rounded-lg">
              <button 
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50" 
                onClick={() => toggleSectionExpansion('aboutGuide')}
              >
                <h2 className="text-lg font-semibold text-gray-900">About your wellness guide</h2>
                {expandedSections.aboutGuide ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.aboutGuide && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  <div className="flex items-start space-x-4">
                    {classDetails.wellnessGuide.profilePictures?.[0] && (
                      <img
                        src={classDetails.wellnessGuide.profilePictures[0].url}
                        alt={`${classDetails.wellnessGuide.user?.firstName} ${classDetails.wellnessGuide.user?.lastName}`}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {classDetails.wellnessGuide.user?.firstName} {classDetails.wellnessGuide.user?.lastName}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {classDetails.wellnessGuide.profileDescription}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What You'll Learn */}
          {classDetails.skillsToLearn && classDetails.skillsToLearn.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <button 
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50" 
                onClick={() => toggleSectionExpansion('skillsToLearn')}
              >
                <h2 className="text-lg font-semibold text-gray-900">What you'll learn</h2>
                {expandedSections.skillsToLearn ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.skillsToLearn && (
                <div className="border-t border-gray-200 p-4">
                  <ul className="space-y-2">
                    {classDetails.skillsToLearn.map((skill, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-600">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Class Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">About This Class</h2>
            <p className="text-gray-600 leading-relaxed">{classDetails.description}</p>
          </div>

          {/* Certifications */}
          {classDetails.guideCertifications && classDetails.guideCertifications.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <button 
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50" 
                onClick={() => toggleSectionExpansion('certifications')}
              >
                <h2 className="text-lg font-semibold text-gray-900">Guide certifications</h2>
                {expandedSections.certifications ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.certifications && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {classDetails.guideCertifications.map((cert, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* About Sections */}
          {classDetails.aboutSections && classDetails.aboutSections.length > 0 && classDetails.aboutSections.some(section => section.header || section.paragraph) && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">More Details</h2>
              <div className="space-y-4">
                {classDetails.aboutSections.map((section, index) => (
                  <div key={index}>
                    {section.header && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {section.header}
                      </h3>
                    )}
                    {section.paragraph && (
                      <p className="text-gray-600 leading-relaxed">
                        {section.paragraph}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* See More Classes Section */}
      <div style={{ background: '#fff', padding: '2rem 1rem 4rem 1rem', maxWidth: '1400px', margin: '4rem auto 0 auto' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-700 mb-2 tracking-tight">Discover More Wellness Classes</h2>
          <div className="text-lg text-gray-600 font-medium">Explore other expert-led wellness classes curated just for you</div>
        </div>
        {seeMoreLoading ? (
          <div className="text-center text-gray-500 py-8">Loading more classes...</div>
        ) : seeMoreError ? (
          <div className="text-center text-red-500 py-8">{seeMoreError}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
            {seeMoreClasses.map((cls, idx) => (
              <div
                key={cls._id || idx}
                className="bg-gray-50 rounded-none shadow-md overflow-hidden transition-transform duration-300 ease-in-out cursor-pointer border border-gray-200 hover:scale-[1.015]"
                onClick={() => navigate(`/class/${cls._id}`)}
              >
                <img
                  src={cls.photos?.[0] || '/fallback.jpg'}
                  alt={cls.title || 'Wellness Class'}
                  className="w-full h-56 object-cover object-center block"
                />
                <div className="p-4 pt-4 pb-2">
                  <div className="text-sm font-extralight text-gray-800 min-h-12 mb-2 text-center">{cls.title}</div>
                  <div className="text-lg text-gray-700 font-normal text-left ml-2 mt-2">
                    {cls.modes?.online?.price || cls.modes?.offline?.price 
                      ? `From Rs. ${Math.min(
                          cls.modes.online?.price || Infinity,
                          cls.modes.offline?.price || Infinity
                        ).toLocaleString('en-IN')}`
                      : 'Price on request'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessGuideClassPage; 