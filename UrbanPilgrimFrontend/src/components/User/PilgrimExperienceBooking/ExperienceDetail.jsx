// src/components/User/ExperienceBooking/ExperienceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  CurrencyRupeeIcon, 
  CalendarIcon,
  ShoppingCartIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { pilgrimExperienceApi } from '../../../services/pilgrimExperienceApi';
import DateTimeSelector from './DateTimeSelector';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      setLoading(true);
      const data = await pilgrimExperienceApi.getById(id);
      setExperience(data.pilgrimExperience);
    } catch (err) {
      setError(err.message || 'Failed to fetch experience details');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slotInfo) => {
    setSelectedSlots(prev => {
      const isAlreadySelected = prev.some(slot => 
        slot.dateId === slotInfo.dateId && slot.slotId === slotInfo.slotId
      );

      if (isAlreadySelected) {
        // Remove the slot
        return prev.filter(slot => 
          !(slot.dateId === slotInfo.dateId && slot.slotId === slotInfo.slotId)
        );
      } else {
        // Add the slot
        return [...prev, slotInfo];
      }
    });
  };

  const handleAddToCart = () => {
    if (selectedSlots.length === 0) {
      alert('Please select at least one time slot');
      return;
    }

    // Add to cart logic here
    // Each selected slot will be a separate cart item
    console.log('Adding to cart:', selectedSlots);
    
    // For now, just show an alert
    alert(`Added ${selectedSlots.length} slot(s) to cart!`);
  };

  const getTotalPrice = () => {
    return selectedSlots.length * (experience?.price || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => navigate('/experiences')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Experience not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => navigate('/experiences')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{experience.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Experience Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            {experience.images && experience.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img
                  src={experience.images[0].url}
                  alt={experience.name}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{experience.name}</h2>
                <div className="flex items-center text-lg font-semibold text-gray-900">
                  <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                  ₹{experience.price?.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center text-gray-600 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                {experience.location}
              </div>

              {experience.whatToExpect && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">What to Expect</h3>
                  <p className="text-gray-600">{experience.whatToExpect}</p>
                </div>
              )}
            </div>

            {/* About Sections */}
            {experience.about && experience.about.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About This Experience</h3>
                {experience.about.map((section, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    {section.heading && (
                      <h4 className="font-semibold text-gray-900 mb-2">{section.heading}</h4>
                    )}
                    {section.paragraphs.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-gray-600 mb-2 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Program Schedule */}
            {experience.programSchedule && experience.programSchedule.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Schedule</h3>
                {experience.programSchedule.map((day, dayIndex) => (
                  <div key={dayIndex} className="mb-6 last:mb-0">
                    <h4 className="font-semibold text-gray-900 mb-3">{day.dayTitle}</h4>
                    <div className="space-y-3">
                      {day.activities.map((activity, actIndex) => (
                        <div key={actIndex} className="border-l-2 border-amber-200 pl-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">{activity.time}</p>
                              <h5 className="font-medium text-gray-900">{activity.displayTitle}</h5>
                              {activity.subheading && (
                                <p className="text-sm text-amber-600 italic">{activity.subheading}</p>
                              )}
                              <p className="text-gray-600 mt-1">{activity.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Terms and Conditions */}
            {experience.termsAndConditions && experience.termsAndConditions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Terms and Conditions</h3>
                <ul className="space-y-2">
                  {experience.termsAndConditions.map((term, index) => (
                    <li key={index} className="text-gray-600 text-sm flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <DateTimeSelector
                  experience={experience}
                  onSlotSelect={handleSlotSelect}
                  selectedSlots={selectedSlots}
                />

                {/* Selected Slots Summary */}
                {selectedSlots.length > 0 && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Selected Slots</h4>
                    <div className="space-y-2">
                      {selectedSlots.map((slot, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {new Date(slot.date).toLocaleDateString()} - {slot.startTime}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-amber-200 mt-3 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">Total:</span>
                        <span className="font-semibold text-lg text-gray-900">
                          ₹{getTotalPrice().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={selectedSlots.length === 0}
                  className="w-full mt-6 flex items-center justify-center px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart ({selectedSlots.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;