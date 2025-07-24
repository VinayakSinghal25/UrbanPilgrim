// src/components/PilgrimExperiences/PilgrimExperienceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  InformationCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { pilgrimExperienceApi } from '../../../../services/pilgrimExperienceApi';
import { BASE_URL } from '../../../../utils/constants';

const PilgrimExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedOccupancy, setSelectedOccupancy] = useState('Single');
  const [quantity, setQuantity] = useState(1);
  const [expandedDays, setExpandedDays] = useState({});
  const [expandedSections, setExpandedSections] = useState({
    aboutGuide: false,
    whatsIncluded: false,
    whatsNotIncluded: false
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [userConsent, setUserConsent] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchExperience();
  }, [id]);

  useEffect(() => {
    if (experience?.availableDates?.length > 0) {
      const nextAvailableDate = experience.availableDates.find(
        date => new Date(date.from) >= new Date()
      );
      if (nextAvailableDate) {
        const fromDate = new Date(nextAvailableDate.from).toISOString().split('T')[0];
        const toDate = new Date(nextAvailableDate.to).toISOString().split('T')[0];
        setSelectedDate(`${fromDate} to ${toDate}`);
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
    return `Rs. ${price.toLocaleString()}.00`;
  };

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

  const nextImage = () => {
    if (experience?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === experience.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (experience?.images?.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? experience.images.length - 1 : prev - 1
      );
    }
  };

  const toggleDayExpansion = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const toggleSectionExpansion = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  // Helper to calculate number of nights between two dates
  const getNumberOfNights = () => {
    if (!selectedDate) return 1;
    const [from, to] = selectedDate.split(' to ');
    if (!from || !to) return 1;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffTime = toDate - fromDate;
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return nights;
  };

  // Calculate total price
  const nights = getNumberOfNights();
  const perNightPrice = getCurrentPrice();
  const totalPrice = perNightPrice ? perNightPrice * nights * quantity : null;

  const handleBookNow = async () => {
    setBookingError(null);
    if (!selectedDate) {
      setBookingError('Please select a package/date.');
      return;
    }
    if (!userConsent) {
      setBookingError('You must agree to the terms and conditions.');
      return;
    }
    setBookingLoading(true);
    try {
      // Parse selectedDates (assume format: 'YYYY-MM-DD to YYYY-MM-DD')
      const [from, to] = selectedDate.split(' to ');
      const payload = {
        experienceId: experience._id,
        occupancy: selectedOccupancy,
        sessionCount: quantity,
        selectedDates: { from, to },
        userConsent: true
      };
      // Assume JWT token is in localStorage (adjust as needed)
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/bookings/pilgrim/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        setBookingError(data.message || 'Booking failed.');
        setBookingLoading(false);
        return;
      }
      // Redirect to payment URL
      window.location.href = data.data.paymentUrl;
    } catch (err) {
      setBookingError('Booking failed. Please try again.');
      setBookingLoading(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 md:gap-8 pt-6 pb-24">
        {/* Left: Image Carousel */}
        <div className="w-full md:w-[45%] flex-shrink-0 relative">
          <div className="sticky top-8">
            <div className="relative w-full h-[320px] sm:h-[420px] md:h-[600px] rounded-2xl overflow-hidden shadow-lg">
              {experience.images && experience.images.length > 0 ? (
                <img
                  src={experience.images[currentImageIndex]?.url}
                  alt={experience.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                  <MapPinIcon className="h-16 w-16 text-amber-400" />
                </div>
              )}
              {/* Carousel Controls */}
              {experience.images && experience.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeftIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow z-10"
                    aria-label="Next image"
                  >
                    <ChevronRightIcon className="h-6 w-6 text-gray-800" />
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {experience.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`inline-block w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-amber-400' : 'bg-white/60'}`}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Back Button Floating */}
              <button
                onClick={() => navigate('/pilgrim-retreats')}
                className="absolute top-4 left-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-20"
                aria-label="Back to experiences"
              >
                <ArrowLeftIcon className="h-6 w-6 text-gray-800" />
              </button>
            </div>
          </div>
        </div>
        {/* Right: Content */}
        <div className="w-full md:w-[55%] flex flex-col gap-8 px-2 sm:px-4 pt-8 md:pt-0">
          {/* Title, Location, Price */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{experience.name}</h1>
            <div className="flex items-center gap-2 mb-1">
              <MapPinIcon className="h-5 w-5 text-amber-500" />
              <span className="text-gray-700 text-base font-medium">{experience.location}</span>
            </div>
            <span className="text-xl font-semibold text-amber-700">{formatPrice(getCurrentPrice())}</span>
          </div>
          {/* Booking Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 border border-amber-100">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Date Selector */}
              {experience.availableDates && experience.availableDates.length > 0 && (
                <div className="flex-1 flex flex-col">
                  <label className="text-xs text-gray-500 mb-1 text-center">Package Dates</label>
                  <select
                    className="rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  >
                    <option value="">Select</option>
                    {experience.availableDates.map((dateRange, idx) => {
                      const dateValue = `${dateRange.from} to ${dateRange.to}`;
                      return (
                        <option key={idx} value={dateValue}>
                          {formatDateRange(dateRange.from, dateRange.to)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
              {/* Occupancy Selector */}
              {experience.occupancyOptions && experience.occupancyOptions.length > 0 && (
                <div className="flex-1 flex flex-col">
                  <label className="text-xs text-gray-500 mb-1 text-center">Occupancy</label>
                  <select
                    className="rounded-lg border-gray-300 px-3 py-2 text-sm focus:ring-amber-500 focus:border-amber-500"
                    value={selectedOccupancy}
                    onChange={e => setSelectedOccupancy(e.target.value)}
                  >
                    {experience.occupancyOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              )}
              {/* Quantity */}
              <div className="flex-1 flex flex-col items-start">
                <label className="text-xs text-gray-500 mb-1 text-center">Qty</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-50 border-r border-gray-300"
                    disabled={quantity <= 1}
                    type="button"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-3 font-medium min-w-[2ch] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-50 border-l border-gray-300"
                    type="button"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            {/* Price Display */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 mb-2">
              <span className="text-sm text-gray-500">Price per night:</span>
              <span className="text-base font-semibold text-amber-700">{perNightPrice ? `Rs. ${perNightPrice.toLocaleString('en-IN')}` : 'N/A'}</span>
              <span className="text-sm text-gray-500 mx-2">× {nights} night{nights > 1 ? 's' : ''} × {quantity} room{quantity > 1 ? 's' : ''}</span>
              <span className="text-base font-bold text-green-700 ml-auto">Total: {totalPrice ? `Rs. ${totalPrice.toLocaleString('en-IN')}` : 'N/A'}</span>
            </div>
            {/* Consent and Book Now */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none flex-1">
                <input
                  type="checkbox"
                  checked={userConsent}
                  onChange={e => setUserConsent(e.target.checked)}
                  className="accent-amber-600"
                />
                <span>I agree to the <span className="underline text-amber-700 cursor-pointer" onClick={() => setShowTermsModal(true)}>terms and conditions</span></span>
              </label>
              <button
                onClick={handleBookNow}
                disabled={!selectedDate || !userConsent || bookingLoading}
                className="w-full sm:w-auto bg-amber-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md text-lg"
              >
                {bookingLoading ? 'Processing...' : 'Book Now'}
              </button>
            </div>
            {/* Booking Error */}
            {bookingError && <div className="text-red-600 text-xs mt-1 w-full text-center">{bookingError}</div>}
          </div>
          {/* What to Expect */}
          {experience.whatToExpect && (
            <section className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold">What to Expect</h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">{experience.whatToExpect}</p>
            </section>
          )}
          {/* About Sections */}
          {experience.about && experience.about.map((section, index) => (
            <section key={index} className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold">{section.heading}</h2>
              </div>
              <div className="space-y-2">
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-gray-700 leading-relaxed text-base">{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
          {/* About Guide */}
          {experience.retreatGuideBio && (
            <section className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <UsersIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold">About your retreat guide</h2>
              </div>
              <button
                className="flex items-center gap-2 text-left hover:underline mb-2"
                onClick={() => toggleSectionExpansion('aboutGuide')}
                type="button"
              >
                <span className="font-medium text-gray-800">Read Bio</span>
                {expandedSections.aboutGuide ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.aboutGuide && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-700 leading-relaxed mb-2">{experience.retreatGuideBio}</p>
                  {experience.trainerProfileLink && (
                    <button
                      onClick={handleMeetGuideClick}
                      className="inline-flex items-center text-sm text-blue-600 hover:underline gap-1"
                      type="button"
                    >
                      Meet your guide
                    </button>
                  )}
                </div>
              )}
            </section>
          )}
          {/* What's Included */}
          {experience.whatsIncluded && experience.whatsIncluded.length > 0 && (
            <section className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckIcon className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-bold">What's included in the package</h2>
              </div>
              <button
                className="flex items-center gap-2 text-left hover:underline mb-2"
                onClick={() => toggleSectionExpansion('whatsIncluded')}
                type="button"
              >
                <span className="font-medium text-gray-800">View List</span>
                {expandedSections.whatsIncluded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.whatsIncluded && (
                <div className="border-t border-gray-200 pt-4">
                  <ul className="space-y-2">
                    {experience.whatsIncluded.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-green-700">
                        <span className="text-green-500"><CheckIcon className="h-5 w-5" /></span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
          {/* What's Not Included */}
          {experience.whatsNotIncluded && experience.whatsNotIncluded.length > 0 && (
            <section className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <XMarkIcon className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-bold">What's not included in the package</h2>
              </div>
              <button
                className="flex items-center gap-2 text-left hover:underline mb-2"
                onClick={() => toggleSectionExpansion('whatsNotIncluded')}
                type="button"
              >
                <span className="font-medium text-gray-800">View List</span>
                {expandedSections.whatsNotIncluded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedSections.whatsNotIncluded && (
                <div className="border-t border-gray-200 pt-4">
                  <ul className="space-y-2">
                    {experience.whatsNotIncluded.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-red-700">
                        <span className="text-red-500"><XMarkIcon className="h-5 w-5" /></span>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
          {/* Program Schedule */}
          {experience.programSchedule && experience.programSchedule.length > 0 && (
            <section className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold">Program Schedule</h2>
              </div>
              <div className="space-y-3">
                {experience.programSchedule.map((day, dayIndex) => (
                  <div key={dayIndex} className="border border-gray-200 rounded-lg mb-2">
                    <button
                      onClick={() => toggleDayExpansion(dayIndex)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 focus:outline-none"
                      type="button"
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
                                <p className="text-sm font-medium text-gray-600 italic">{activity.subheading}</p>
                              )}
                              <p className="text-gray-700 text-sm leading-relaxed">{activity.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Terms and Conditions */}
          {experience.termsAndConditions && experience.termsAndConditions.length > 0 && (
            <section className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <InformationCircleIcon className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-bold">Terms and Conditions</h2>
              </div>
              <button
                onClick={() => setShowTermsModal(true)}
                className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
                type="button"
              >
                <InformationCircleIcon className="h-4 w-4 mr-1" />
                View Terms
              </button>
            </section>
          )}
        </div>
      </div>
      {/* Terms Modal */}
      {showTermsModal && <TermsModal />}
    </div>
  );
};

export default PilgrimExperienceDetail;