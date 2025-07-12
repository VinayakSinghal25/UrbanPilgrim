import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../../api/WellnessGuideClassApi';

const WellnessGuideClassBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classDetails, setClassDetails] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMode, setSelectedMode] = useState('online');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [expandedDates, setExpandedDates] = useState(new Set());

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

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getSlotStatus = (slot) => {
    const availableSlots = slot.maxCapacity - slot.currentBookings;
    if (availableSlots === 0) return 'sold-out';
    if (availableSlots <= 2) return 'fast-filling';
    return 'available';
  };

  const handleDateClick = (date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const handleTimeSlotClick = (slot) => {
    setSelectedTimeSlots(prev => {
      const isSelected = prev.some(s => s._id === slot._id);
      if (isSelected) {
        return prev.filter(s => s._id !== slot._id);
      } else {
        return [...prev, slot];
      }
    });
  };

  const handleModeSwitch = (newMode) => {
    setSelectedMode(newMode);
    setSelectedTimeSlots([]);
  };

  const getPrice = () => {
    if (!classDetails?.modes) return 0;
    
    if (selectedMode === 'online') {
      return classDetails.modes.online?.price || 0;
    } else {
      return classDetails.modes.offline?.price || 0;
    }
  };

  const calculateTotalPrice = () => {
    if (!classDetails) {
      return { subtotal: 0, discount: null, total: 0 };
    }
    
    const basePrice = getPrice();
    const totalSlots = selectedTimeSlots.length;
    const subtotal = basePrice * totalSlots * numberOfPeople;
    
    const discountConfig = selectedMode === 'online' 
      ? classDetails?.adminSettings?.onlineDiscount 
      : classDetails?.adminSettings?.offlineDiscount;

    let discount = null;
    let discountAmount = 0;
    
    if (discountConfig?.isEnabled && totalSlots > 0) {
      const applicableTier = discountConfig.tiers
        ?.filter(tier => totalSlots >= tier.minClasses)
        ?.sort((a, b) => b.discountPercentage - a.discountPercentage)?.[0];
      
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

  const isSlotSelected = (slot) => selectedTimeSlots.some(selectedSlot => selectedSlot._id === slot._id);

  const filteredTimeSlots = timeSlots.filter(slot => slot.mode === selectedMode);

  const groupedSlots = filteredTimeSlots.reduce((groups, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort();

  const pricing = calculateTotalPrice();

  const formatDiscountText = (discount) => {
    if (!discount.isEnabled || !discount.tiers || discount.tiers.length === 0) {
      return null;
    }
    
    const minTier = discount.tiers.reduce((min, tier) => 
      tier.minClasses < min.minClasses ? tier : min
    );
    
    return `Get up to ${Math.max(...discount.tiers.map(t => t.discountPercentage))}% off when you book ${minTier.minClasses}+ sessions`;
  };

  const handleBookNow = () => {
    if (selectedTimeSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }
    const slotIds = selectedTimeSlots.map((s) => s._id);
    navigate(
      `/class-booking/review?classId=${id}&slotIds=${encodeURIComponent(
        JSON.stringify(slotIds)
      )}&attendeeCount=${numberOfPeople}`
    );
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Class Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load class details'}</p>
          <button
            onClick={() => navigate('/wellness-guide-classes')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Browse All Classes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Booking Summary Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Back Button & Class Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {classDetails.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {classDetails.wellnessGuide?.user?.firstName} {classDetails.wellnessGuide?.user?.lastName}
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            {selectedTimeSlots.length > 0 && (
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-right">
                  <div className="text-xs sm:text-sm text-gray-600">
                    {selectedTimeSlots.length} session{selectedTimeSlots.length > 1 ? 's' : ''} • {numberOfPeople} {numberOfPeople > 1 ? 'people' : 'person'}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    ₹{pricing.total.toLocaleString()}
                    {pricing.discount && (
                      <span className="text-xs text-green-600 ml-1">
                        ({pricing.discount.discountPercentage}% off)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBookNow}
                    className="bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Class Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 sticky top-20">
              {/* Class Image */}
              {classDetails.photos?.[0] && (
                <img
                  src={classDetails.photos[0]}
                  alt={classDetails.title}
                  className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4"
                />
              )}
              
              {/* Class Title */}
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {classDetails.title}
              </h2>
              
              {/* Guide Info */}
              <div className="flex items-center space-x-3 mb-4">
                {classDetails.wellnessGuide?.profilePictures?.[0] && (
                  <img
                    src={classDetails.wellnessGuide.profilePictures[0].url}
                    alt="Guide"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {classDetails.wellnessGuide?.user?.firstName} {classDetails.wellnessGuide?.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Wellness Guide</p>
                </div>
              </div>

              {/* Mode Selection */}
              {classDetails?.modes?.online?.enabled && classDetails?.modes?.offline?.enabled ? (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Choose Mode</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleModeSwitch('online')}
                      className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
                        selectedMode === 'online'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">💻</span>
                          <span className="text-sm">Online</span>
                        </div>
                        <span className="text-sm font-bold">₹{classDetails?.modes?.online?.price || 0}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleModeSwitch('offline')}
                      className={`w-full p-3 rounded-lg font-medium transition-all duration-200 ${
                        selectedMode === 'offline'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">📍</span>
                          <span className="text-sm">Offline</span>
                        </div>
                        <span className="text-sm font-bold">₹{classDetails?.modes?.offline?.price || 0}</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {classDetails?.modes?.online?.enabled ? '💻' : '📍'}
                      </span>
                      <span className="text-sm font-medium">
                        {classDetails?.modes?.online?.enabled ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <span className="text-sm font-bold">₹{getPrice()}</span>
                  </div>
                </div>
              )}

              {/* Location & Address Info for Single Offline Mode */}
              {!classDetails?.modes?.online?.enabled && classDetails?.modes?.offline?.enabled && (
                <div className="mt-3 space-y-3">
                  {/* Location */}
                  {classDetails?.modes?.offline?.location && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-blue-900">Location</h4>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">
                        {classDetails.modes.offline.location}
                      </p>
                    </div>
                  )}
                  
                  {/* Address */}
                  {classDetails?.modes?.offline?.address && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        {classDetails.modes.offline.address.street && (
                          <p>{classDetails.modes.offline.address.street}</p>
                        )}
                        <p>
                          {[
                            classDetails.modes.offline.address.city,
                            classDetails.modes.offline.address.state,
                            classDetails.modes.offline.address.zipCode || classDetails.modes.offline.address.pincode
                          ].filter(Boolean).join(', ')}
                        </p>
                        {classDetails.modes.offline.address.country && (
                          <p className="text-xs text-gray-500">{classDetails.modes.offline.address.country}</p>
                        )}
                        {classDetails.modes.offline.address.landmark && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Landmark:</span> {classDetails.modes.offline.address.landmark}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location & Address Info for Offline Mode */}
              {selectedMode === 'offline' && classDetails?.modes?.offline?.enabled && (
                <div className="mt-4 space-y-3">
                  {/* Location */}
                  {classDetails?.modes?.offline?.location && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h4 className="text-sm font-semibold text-blue-900">Location</h4>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">
                        {classDetails.modes.offline.location}
                      </p>
                    </div>
                  )}
                  
                  {/* Address */}
                  {classDetails?.modes?.offline?.address && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h4 className="text-sm font-semibold text-gray-900">Address</h4>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        {classDetails.modes.offline.address.street && (
                          <p>{classDetails.modes.offline.address.street}</p>
                        )}
                        <p>
                          {[
                            classDetails.modes.offline.address.city,
                            classDetails.modes.offline.address.state,
                            classDetails.modes.offline.address.zipCode || classDetails.modes.offline.address.pincode
                          ].filter(Boolean).join(', ')}
                        </p>
                        {classDetails.modes.offline.address.country && (
                          <p className="text-xs text-gray-500">{classDetails.modes.offline.address.country}</p>
                        )}
                        {classDetails.modes.offline.address.landmark && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Landmark:</span> {classDetails.modes.offline.address.landmark}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Discount Info */}
              {(() => {
                const discountConfig = selectedMode === 'online' 
                  ? classDetails?.adminSettings?.onlineDiscount 
                  : classDetails?.adminSettings?.offlineDiscount;
                const discountText = formatDiscountText(discountConfig);
                
                return discountText ? (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700">{discountText}</p>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* Main Booking Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                  Available Dates & Times
                </h2>
                
                {/* People Counter */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <label className="text-sm font-medium text-gray-700">People</label>
                  </div>
                  <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm">
                    <button
                      onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                      disabled={numberOfPeople <= 1}
                      className={`p-2 rounded-l-lg transition-all duration-200 ${
                        numberOfPeople <= 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600 active:bg-gray-100'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <div className="px-4 py-2 bg-gray-50 border-x border-gray-200">
                      <span className="text-sm font-semibold text-gray-900 min-w-[2rem] text-center block">
                        {numberOfPeople}
                      </span>
                    </div>
                    <button
                      onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                      className="p-2 rounded-r-lg bg-white text-gray-600 hover:bg-gray-50 hover:text-emerald-600 active:bg-gray-100 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div className="space-y-4">
                {sortedDates.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No available time slots for {selectedMode} mode.</p>
                  </div>
                ) : (
                  sortedDates.map(date => {
                    const dateSlots = groupedSlots[date];
                    const isExpanded = expandedDates.has(date);
                    
                    return (
                      <div key={date} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Date Header */}
                        <button
                          onClick={() => handleDateClick(date)}
                          className="w-full px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">
                              {formatDisplayDate(date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(date).toLocaleDateString('en-GB')} • {dateSlots.length} slot{dateSlots.length > 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className={`transform transition-transform text-gray-600 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        
                        {/* Time Slots */}
                        {isExpanded && (
                          <div className="p-4 bg-white">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {dateSlots
                                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                .map((slot) => {
                                  const status = getSlotStatus(slot);
                                  const selected = isSlotSelected(slot);
                                  const availableSlots = slot.maxCapacity - slot.currentBookings;
                                  
                                  return (
                                    <button
                                      key={slot._id}
                                      onClick={() => status !== 'sold-out' && handleTimeSlotClick(slot)}
                                      disabled={status === 'sold-out'}
                                      className={`
                                        p-3 rounded-lg text-sm font-medium transition-all duration-200 text-center
                                        ${selected
                                          ? 'bg-emerald-600 text-white shadow-md transform scale-105'
                                          : status === 'sold-out'
                                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                          : status === 'fast-filling'
                                          ? 'bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200'
                                          : 'bg-gray-50 text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                                        }
                                      `}
                                    >
                                      <div className="font-semibold">{slot.startTime}</div>
                                      <div className="text-xs opacity-75 mt-1">
                                        {status === 'sold-out' 
                                          ? 'Sold Out' 
                                          : `${availableSlots} left`
                                        }
                                      </div>
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Action Buttons */}
              {selectedTimeSlots.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Summary */}
                    <div className="flex-1 text-center sm:text-left">
                      <div className="text-sm text-gray-600 mb-1">
                        {selectedTimeSlots.length} session{selectedTimeSlots.length > 1 ? 's' : ''} selected for {numberOfPeople} {numberOfPeople > 1 ? 'people' : 'person'}
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        Total: ₹{pricing.total.toLocaleString()}
                        {pricing.discount && (
                          <span className="text-sm text-green-600 ml-2">
                            ({pricing.discount.discountPercentage}% discount applied)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 sm:gap-4">
                      <button className="flex-1 sm:flex-none bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                        Add to Cart
                      </button>
                      <button
                        onClick={handleBookNow}
                        className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessGuideClassBooking; 