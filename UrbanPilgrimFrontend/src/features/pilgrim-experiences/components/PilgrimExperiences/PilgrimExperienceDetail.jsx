// src/components/PilgrimExperiences/PilgrimExperienceDetail.jsx
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
import { pilgrimExperienceApi } from '../../../../services/pilgrimExperienceApi';
import '../../../pilgrim-retreats/components/RetreatGrid.css';

const PilgrimExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [selectedOccupancy, setSelectedOccupancy] = useState('Single');
  const [quantity, setQuantity] = useState(1);
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    aboutGuide: false,
    whatsIncluded: false,
    whatsNotIncluded: false
  });
  const [showTermsModal, setShowTermsModal] = useState(false);

  // See More Experiences State
  const [seeMoreExperiences, setSeeMoreExperiences] = useState([]);
  const [seeMoreLoading, setSeeMoreLoading] = useState(false);
  const [seeMoreError, setSeeMoreError] = useState(null);

  // Image carousel navigation
  const prevImage = () => {
    if (experience?.images?.length > 0) {
      setCurrentImageIndex((prev) => prev === 0 ? experience.images.length - 1 : prev - 1);
    }
  };

  const nextImage = () => {
    if (experience?.images?.length > 0) {
      setCurrentImageIndex((prev) => prev === experience.images.length - 1 ? 0 : prev + 1);
    }
  };

  // Fetch experience details by ID
  const fetchExperience = async () => {
    try {
      setLoading(true);
      const data = await pilgrimExperienceApi.getById(id);
      setExperience(data.pilgrimExperience);
    } catch (err) {
      setError(err.message || 'Failed to fetch experience details');
      console.error('Error fetching experience:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, [id]);

  // Fetch 4 more experiences for 'See More' section
  const fetchSeeMoreExperiences = useCallback(async () => {
    setSeeMoreLoading(true);
    setSeeMoreError(null);
    try {
      // Fetch a list, filter out current experience
      const data = await pilgrimExperienceApi.getAll({ limit: 8 });
      let filtered = data.pilgrimExperiences.filter(e => e._id !== id);
      setSeeMoreExperiences(filtered.slice(0, 4));
    } catch (err) {
      setSeeMoreError('Could not load more experiences');
    } finally {
      setSeeMoreLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSeeMoreExperiences();
  }, [fetchSeeMoreExperiences]);

  useEffect(() => {
    if (experience?.availableDates?.length > 0) {
      const nextAvailableDate = experience.availableDates.find(
        date => new Date(date.from) >= new Date()
      );
      if (nextAvailableDate) {
        setSelectedDateRange(nextAvailableDate);
      }
    }
  }, [experience]);

  // Function to get current price based on selected occupancy
  const getCurrentPrice = () => {
    if (!experience) return null;
    
    if (selectedOccupancy === 'Couple' && experience.priceCouple) {
      return experience.priceCouple;
    } else if (selectedOccupancy === 'Single' && experience.priceSingle) {
      return experience.priceSingle;
    }
    
    // Fallback to old price field if new fields don't exist
    return experience.price || null;
  };

  const formatPrice = (price) => {
    if (!price) return 'Price on request';
    return `Rs. ${price.toLocaleString()}.00/day`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate.getMonth() === toDate.getMonth() && fromDate.getFullYear() === toDate.getFullYear()) {
      return `${fromDate.getDate()}-${toDate.getDate()} ${fromDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    
    return `${formatDate(from)} - ${formatDate(to)}`;
  };

    const handleBookNow = () => {
    if (!selectedDateRange) {
      alert('Please select a date range first');
      return;
    }

    try {
      // Check if user is authenticated
      if (!user || !token) {
        // Save current booking parameters and redirect to login
        const bookingParams = new URLSearchParams({
          experienceId: id,
          occupancy: selectedOccupancy,
          sessionCount: quantity,
          selectedDates: JSON.stringify(selectedDateRange)
        });
        
        const bookingUrl = `/booking/review?${bookingParams.toString()}`;
        navigate(`/login?redirect=${encodeURIComponent(bookingUrl)}`);
        return;
      }

      // Create booking parameters
      const bookingParams = new URLSearchParams({
        experienceId: id,
        occupancy: selectedOccupancy,
        sessionCount: quantity,
        selectedDates: JSON.stringify(selectedDateRange)
      });

      const bookingReviewUrl = `/booking/review?${bookingParams.toString()}`;
      
      // Navigate to booking review page
      navigate(bookingReviewUrl);
    } catch (error) {
      console.error('Error in handleBookNow:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleMeetGuideClick = () => {
    if (experience?.trainerProfileLink) {
      window.open(experience.trainerProfileLink, '_blank');
    }
  };

  const handleMapClick = () => {
    if (experience?.mapLink) {
      window.open(experience.mapLink, '_blank');
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  // Helper to calculate number of nights between two dates
  const getNumberOfNights = () => {
    if (!selectedDateRange) return 1;
    const fromDate = new Date(selectedDateRange.from);
    const toDate = new Date(selectedDateRange.to);
    // Add 1 to include the last night if needed (e.g., 24th to 27th = 3 nights)
    const diffTime = toDate - fromDate;
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return nights;
  };

  // Get per night price based on selected occupancy
  const getPerNightPrice = () => {
    if (!experience) return 0;
    if (selectedOccupancy === 'Single' && experience.priceSingle) return experience.priceSingle;
    if (selectedOccupancy === 'Couple' && experience.priceCouple) return experience.priceCouple;
    return experience.price || 0;
  };

  const nights = getNumberOfNights();
  const perNightPrice = getPerNightPrice();
  const totalPrice = perNightPrice * nights * quantity;

  // Terms and Conditions Modal
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Terms and Conditions</h3>
          <button
            onClick={() => setShowTermsModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {experience?.termsAndConditions?.map((term, index) => (
            <p key={index} className="text-gray-600 mb-4 leading-relaxed">
              {term}
            </p>
          ))}
        </div>
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setShowTermsModal(false)}
            className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experience details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Experience</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button 
                onClick={fetchExperience}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/pilgrim-experiences')}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                Back to Experiences
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Experience Not Found</h3>
          <p className="text-gray-600 mb-4">The requested experience could not be found.</p>
          <button 
            onClick={() => navigate('/pilgrim-experiences')}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Back to Experiences
          </button>
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
              onClick={() => navigate('/pilgrim-experiences')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {formatPrice(getCurrentPrice())}
              </p>
              <p className="text-xs text-gray-400">
                {selectedOccupancy} Occupancy
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">URBAN PILGRIM</p>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              {experience.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Side - Fixed Image with adjusted size and spacing */}
        <div className="w-1/2 flex flex-col items-center justify-start pt-8 pb-8 bg-white sticky top-0 h-screen relative">
          <div className="w-[96%] max-w-[640px] aspect-square rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
            {experience.images && experience.images.length > 0 ? (
              <img
                src={experience.images[currentImageIndex]?.url}
                alt={experience.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-600 font-medium">Spiritual Journey</p>
                </div>
              </div>
            )}
          </div>
          {/* Thumbnails under main image */}
          {experience.images && experience.images.length > 1 && (
            <div className="flex gap-2 mt-4 justify-center w-[90%] max-w-[520px]">
              {experience.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`thumb-${idx}`}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-14 h-14 object-cover rounded-lg border cursor-pointer transition-all ${idx === currentImageIndex ? 'border-black ring-2 ring-black' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          )}
          {/* Back Button */}
          <button
            onClick={() => navigate('/pilgrim-retreats')}
            className="absolute top-8 left-8 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>
        {/* Right Side - All Content with spacing */}
        <div className="w-1/2 bg-white flex flex-col justify-between">
          <div className="p-8 pt-12 space-y-8">
            {/* Header */}
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">URBAN PILGRIM</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{experience.name}</h1>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(getCurrentPrice())}
                </p>
                <span className="text-sm text-gray-500">
                  ({selectedOccupancy === 'Couple' ? 'Twin' : selectedOccupancy} Occupancy)
                </span>
              </div>
              {/* Duration Display */}
              {experience.numberOfDays && experience.numberOfNights && (
                <p className="text-sm text-gray-600 mt-1">
                  Duration : {experience.numberOfNights} Nights, {experience.numberOfDays} Days
                </p>
              )}
            </div>

            {/* Package Options */}
            {experience.availableDates && experience.availableDates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Package Options</label>
                <div className="space-y-2">
                  {experience.availableDates.map((dateRange, index) => {
                    const isSelected = selectedDateRange && 
                      selectedDateRange.from === dateRange.from && 
                      selectedDateRange.to === dateRange.to;
                    return (
                      <label 
                        key={index} 
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dateRange"
                          value={index}
                          checked={isSelected}
                          onChange={() => setSelectedDateRange(dateRange)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">
                          {formatDateRange(dateRange.from, dateRange.to)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Occupancy */}
            {experience.occupancyOptions && experience.occupancyOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Occupancy</label>
                <div className="flex space-x-2">
                  {experience.occupancyOptions.map((option) => {
                    const isSelected = selectedOccupancy === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setSelectedOccupancy(option)}
                        className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                          isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {option === 'Couple' ? 'Twin' : 'Single'}
                        {/* Show price for each option */}
                        <div className="text-xs mt-1">
                          {option === 'Single' && experience.priceSingle && (
                            <span>₹{experience.priceSingle.toLocaleString()}/day</span>
                          )}
                          {option === 'Couple' && experience.priceCouple && (
                            <span>₹{experience.priceCouple.toLocaleString()}/day</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location Information - Moved here after Occupancy */}
            {(experience.location || experience.address || experience.mapLink) && (
              <div className="space-y-3">
                {experience.location && (
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{experience.location}</span>
                  </div>
                )}
                
                {experience.address && (
                  <p className="text-sm text-gray-600 leading-relaxed pl-7">
                    {experience.address}
                  </p>
                )}
                
                {experience.mapLink && (
                  <button
                    onClick={handleMapClick}
                    className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 pl-7"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    View on Map
                  </button>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                No of persons/sessions (1 in cart)
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg max-w-xs">
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

            {/* Date Selection Message */}
            {!selectedDateRange && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm text-center">
                  Please select a package option above to continue with booking
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 mb-2">
              <span className="text-sm text-gray-500">Price per night:</span>
              <span className="text-base font-semibold text-amber-700">{perNightPrice ? `Rs. ${perNightPrice.toLocaleString('en-IN')}` : 'N/A'}</span>
              <span className="text-sm text-gray-500 mx-2">× {nights} night{nights > 1 ? 's' : ''} × {quantity} room{quantity > 1 ? 's' : ''}</span>
              <span className="text-base font-bold text-green-700 ml-auto">Total: {totalPrice ? `Rs. ${totalPrice.toLocaleString('en-IN')}` : 'N/A'}</span>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleBookNow}
              disabled={!selectedDateRange}
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Book Now
            </button>

            {/* About Sections */}
            {experience.about && experience.about.map((section, index) => (
              <div key={index} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>
                <div className="space-y-4">
                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-gray-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* What to Expect */}
            {experience.whatToExpect && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">What to Expect</h2>
                <p className="text-gray-600 leading-relaxed">{experience.whatToExpect}</p>
              </div>
            )}

            {/* About Your Retreat Guide */}
            {experience.retreatGuideBio && (
              <div className="border border-gray-200 rounded-lg">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                  onClick={() => toggleSectionExpansion('aboutGuide')}
                >
                  <h2 className="text-lg font-semibold text-gray-900">About your retreat guide</h2>
                  {expandedSections.aboutGuide ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.aboutGuide && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    <p className="text-gray-600 leading-relaxed">{experience.retreatGuideBio}</p>
                    {experience.trainerProfileLink && (
                      <button
                        onClick={handleMeetGuideClick}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Meet your guide
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* What's Included */}
            {experience.whatsIncluded && experience.whatsIncluded.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                  onClick={() => toggleSectionExpansion('whatsIncluded')}
                >
                  <h2 className="text-lg font-semibold text-gray-900">What's included in the package</h2>
                  {expandedSections.whatsIncluded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.whatsIncluded && (
                  <div className="border-t border-gray-200 p-4">
                    <ul className="space-y-2">
                      {experience.whatsIncluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* What's Not Included */}
            {experience.whatsNotIncluded && experience.whatsNotIncluded.length > 0 && (
              <div className="border border-gray-200 rounded-lg">
                <button 
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                  onClick={() => toggleSectionExpansion('whatsNotIncluded')}
                >
                  <h2 className="text-lg font-semibold text-gray-900">What's not included in the package</h2>
                  {expandedSections.whatsNotIncluded ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                
                {expandedSections.whatsNotIncluded && (
                  <div className="border-t border-gray-200 p-4">
                    <ul className="space-y-2">
                      {experience.whatsNotIncluded.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 mt-1">✗</span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Program Schedule */}
            {experience.programSchedule && experience.programSchedule.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Program Schedule</h2>
                <div className="space-y-3">
                  {experience.programSchedule.map((day, dayIndex) => (
                    <div key={dayIndex} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleDayExpansion(dayIndex)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                      >
                        <h3 className="font-semibold text-gray-900">{day.dayTitle}</h3>
                        {expandedDays[dayIndex] ? (
                          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedDays[dayIndex] && (
                        <div className="border-t border-gray-200 p-4">
                          <div className="space-y-6">
                            {day.activities.map((activity, activityIndex) => (
                              <div key={activityIndex} className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{activity.displayTitle}</h4>
                                    <p className="text-sm text-gray-500">{activity.time}</p>
                                  </div>
                                </div>
                                {activity.subheading && (
                                  <p className="text-sm font-medium text-gray-600 italic">
                                    {activity.subheading}
                                  </p>
                                )}
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {activity.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            {experience.termsAndConditions && experience.termsAndConditions.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                >
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  Terms and Conditions
                </button>
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
            {experience.images && experience.images.length > 0 ? (
              <img
                src={experience.images[currentImageIndex]?.url}
                alt={experience.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="text-center">
                  <MapPinIcon className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                  <p className="text-amber-600 font-medium">Spiritual Journey</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Image Navigation */}
          {experience.images && experience.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm p-2 rounded-full shadow-lg"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {currentImageIndex + 1}/{experience.images.length}
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
                ({selectedOccupancy === 'Couple' ? 'Twin' : selectedOccupancy} Occupancy)
              </span>
            </div>
            {/* Duration Display */}
            {experience.numberOfDays && experience.numberOfNights && (
              <p className="text-sm text-gray-600 mt-1">
                Duration : {experience.numberOfNights} Nights, {experience.numberOfDays} Days
              </p>
            )}
          </div>

          {/* Package Options */}
          {experience.availableDates && experience.availableDates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Package Options</label>
              <div className="space-y-2">
                {experience.availableDates.map((dateRange, index) => {
                  const isSelected = selectedDateRange && 
                    selectedDateRange.from === dateRange.from && 
                    selectedDateRange.to === dateRange.to;
                  return (
                    <label 
                      key={index} 
                      className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="dateRange"
                        value={index}
                        checked={isSelected}
                        onChange={() => setSelectedDateRange(dateRange)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">
                        {formatDateRange(dateRange.from, dateRange.to)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Occupancy */}
          {experience.occupancyOptions && experience.occupancyOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Occupancy</label>
              <div className="flex space-x-2">
                {experience.occupancyOptions.map((option) => {
                  const isSelected = selectedOccupancy === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedOccupancy(option)}
                      className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                        isSelected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {option === 'Couple' ? 'Twin' : 'Single'}
                      {/* Show price for each option */}
                      <div className="text-xs mt-1">
                        {option === 'Single' && experience.priceSingle && (
                          <span>₹{experience.priceSingle.toLocaleString()}/day</span>
                        )}
                        {option === 'Couple' && experience.priceCouple && (
                          <span>₹{experience.priceCouple.toLocaleString()}/day</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location Information - Also moved here in mobile */}
          {(experience.location || experience.address || experience.mapLink) && (
            <div className="space-y-3">
              {experience.location && (
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{experience.location}</span>
                </div>
              )}
              
              {experience.address && (
                <p className="text-sm text-gray-600 leading-relaxed pl-7">
                  {experience.address}
                </p>
              )}
              
              {experience.mapLink && (
                <button
                  onClick={handleMapClick}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 pl-7"
                >
                  <LinkIcon className="h-4 w-4 mr-1" />
                  View on Map
                </button>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              No of persons/sessions (1 in cart)
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

          {/* Date Selection Message */}
          {!selectedDateRange && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800 text-sm text-center">
                Please select a package option above to continue with booking
              </p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 mb-2">
            <span className="text-sm text-gray-500">Price per night:</span>
            <span className="text-base font-semibold text-amber-700">{perNightPrice ? `Rs. ${perNightPrice.toLocaleString('en-IN')}` : 'N/A'}</span>
            <span className="text-sm text-gray-500 mx-2">× {nights} night{nights > 1 ? 's' : ''} × {quantity} room{quantity > 1 ? 's' : ''}</span>
            <span className="text-base font-bold text-green-700 ml-auto">Total: {totalPrice ? `Rs. ${totalPrice.toLocaleString('en-IN')}` : 'N/A'}</span>
          </div>

          {/* Book Now Button */}
          <button
            onClick={handleBookNow}
            disabled={!selectedDateRange}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Book Now
          </button>

          {/* About Sections */}
          {experience.about && experience.about.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">{section.heading}</h2>
              <div className="space-y-4">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-600 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* What to Expect */}
          {experience.whatToExpect && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">What to Expect</h2>
              <p className="text-gray-600 leading-relaxed">{experience.whatToExpect}</p>
            </div>
          )}

          {/* About Your Retreat Guide */}
          {experience.retreatGuideBio && (
            <div className="border border-gray-200 rounded-lg">
              <button 
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                onClick={() => toggleSectionExpansion('aboutGuide')}
              >
                <h2 className="text-lg font-semibold text-gray-900">About your retreat guide</h2>
                {expandedSections.aboutGuide ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.aboutGuide && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  <p className="text-gray-600 leading-relaxed">{experience.retreatGuideBio}</p>
                  {experience.trainerProfileLink && (
                    <button
                      onClick={handleMeetGuideClick}
                      className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                      Meet your guide
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* What's Included */}
          {experience.whatsIncluded && experience.whatsIncluded.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <button 
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                onClick={() => toggleSectionExpansion('whatsIncluded')}
              >
                <h2 className="text-lg font-semibold text-gray-900">What's included in the package</h2>
                {expandedSections.whatsIncluded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.whatsIncluded && (
                <div className="border-t border-gray-200 p-4">
                  <ul className="space-y-2">
                    {experience.whatsIncluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">✓</span>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* What's Not Included */}
          {experience.whatsNotIncluded && experience.whatsNotIncluded.length > 0 && (
            <div className="border border-gray-200 rounded-lg">
              <button 
                className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50"
                onClick={() => toggleSectionExpansion('whatsNotIncluded')}
              >
                <h2 className="text-lg font-semibold text-gray-900">What's not included in the package</h2>
                {expandedSections.whatsNotIncluded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedSections.whatsNotIncluded && (
                <div className="border-t border-gray-200 p-4">
                  <ul className="space-y-2">
                    {experience.whatsNotIncluded.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">✗</span>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Program Schedule */}
          {experience.programSchedule && experience.programSchedule.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Program Schedule</h2>
              <div className="space-y-3">
                {experience.programSchedule.map((day, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleDayExpansion(dayIndex)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <h3 className="font-semibold text-gray-900">{day.dayTitle}</h3>
                      {expandedDays[dayIndex] ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedDays[dayIndex] && (
                      <div className="border-t border-gray-200 p-4">
                        <div className="space-y-6">
                          {day.activities.map((activity, activityIndex) => (
                            <div key={activityIndex} className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-900">{activity.displayTitle}</h4>
                                  <p className="text-sm text-gray-500">{activity.time}</p>
                                </div>
                              </div>
                              {activity.subheading && (
                                <p className="text-sm font-medium text-gray-600 italic">
                                  {activity.subheading}
                                </p>
                              )}
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {activity.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms and Conditions */}
          {experience.termsAndConditions && experience.termsAndConditions.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowTermsModal(true)}
                className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
              >
                <InformationCircleIcon className="h-4 w-4 mr-1" />
                Terms and Conditions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && <TermsModal />}

      {/* See More Experiences Section */}
      <div style={{ background: '#fff', padding: '2rem 1rem 4rem 1rem', maxWidth: '1400px', margin: '4rem auto 0 auto' }}>
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-amber-700 mb-2 tracking-tight">Discover More Unique Journeys</h2>
          <div className="text-lg text-gray-600 font-medium">Explore other handpicked pilgrim experiences curated just for you</div>
        </div>
        {seeMoreLoading ? (
          <div className="text-center text-gray-500 py-8">Loading more experiences...</div>
        ) : seeMoreError ? (
          <div className="text-center text-red-500 py-8">{seeMoreError}</div>
        ) : (
          <div className="retreats-grid">
            {seeMoreExperiences.map((exp, idx) => (
              <div
                key={exp._id || idx}
                className="retreat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/pilgrim-experiences/${exp._id}`)}
              >
                <img
                  src={exp.images?.[0]?.url || '/fallback.jpg'}
                  alt={exp.title || 'Pilgrim Experience'}
                  className="retreat-image"
                />
                <div style={{ padding: '1rem 0.5rem 0.5rem 0.5rem' }}>
                  <div className="retreat-title">{exp.name}</div>
                  <div className="retreat-price">
                    {exp.price ? `From Rs. ${Number(exp.price).toLocaleString('en-IN')}` : 'Price on request'}
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

export default PilgrimExperienceDetail;