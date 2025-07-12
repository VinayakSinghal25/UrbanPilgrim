import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails } from '../api/WellnessGuideClassApi';

const ViewTimeSlots = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classDetails, setClassDetails] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [selectedMode, setSelectedMode] = useState('all'); // 'all', 'online', 'offline'

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await getClassDetails(classId);
      setClassDetails(response.classDetails);
      setTimeSlots(response.timeSlots || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch class data');
    } finally {
      setLoading(false);
    }
  };

  // Group time slots by date
  const groupSlotsByDate = () => {
    const filteredSlots = selectedMode === 'all' 
      ? timeSlots 
      : timeSlots.filter(slot => slot.mode === selectedMode);

    const grouped = filteredSlots.reduce((acc, slot) => {
      const date = new Date(slot.date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
      return acc;
    }, {});

    // Sort dates and slots within each date
    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    const result = {};
    
    sortedDates.forEach(date => {
      result[date] = grouped[date].sort((a, b) => {
        return new Date(`1970-01-01 ${a.startTime}`) - new Date(`1970-01-01 ${b.startTime}`);
      });
    });

    return result;
  };

  const toggleDateExpansion = (date) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDate = (dateString) => {
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
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (timeString) => {
    return new Date(`1970-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSlotStatusColor = (slot) => {
    const now = new Date();
    const slotDateTime = new Date(slot.startTimeUTC);
    
    if (slotDateTime < now) {
      return 'bg-gray-100 text-gray-600'; // Past
    } else if (slot.currentBookings >= slot.maxCapacity) {
      return 'bg-red-100 text-red-800'; // Full
    } else if (slot.currentBookings > 0) {
      return 'bg-yellow-100 text-yellow-800'; // Partially booked
    } else {
      return 'bg-green-100 text-green-800'; // Available
    }
  };

  const getSlotStatus = (slot) => {
    const now = new Date();
    const slotDateTime = new Date(slot.startTimeUTC);
    
    if (slotDateTime < now) {
      return 'Past';
    } else if (slot.currentBookings >= slot.maxCapacity) {
      return 'Full';
    } else if (slot.currentBookings > 0) {
      return `${slot.availableSlots} left`;
    } else {
      return 'Available';
    }
  };

  const getModeIcon = (mode) => {
    if (mode === 'online') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading time slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate('/wellness-guide-dashboard')}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate();
  const dateKeys = Object.keys(groupedSlots);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Time Slots
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  {classDetails?.title || 'Class'}
                </p>
              </div>
              <button
                onClick={() => navigate('/wellness-guide-dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium text-sm sm:text-base"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Class Information */}
        {classDetails && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Class Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Specialty:</span>
                <p className="text-gray-600">{classDetails.specialty?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Difficulty:</span>
                <p className="text-gray-600">{classDetails.difficulty}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Slots:</span>
                <p className="text-gray-600">{timeSlots.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Timezone:</span>
                <p className="text-gray-600">{classDetails.timezone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setSelectedMode('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedMode === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Slots ({timeSlots.length})
              </button>
              {classDetails?.modes?.online?.enabled && (
                <button
                  onClick={() => setSelectedMode('online')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedMode === 'online'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Online ({timeSlots.filter(s => s.mode === 'online').length})
                </button>
              )}
              {classDetails?.modes?.offline?.enabled && (
                <button
                  onClick={() => setSelectedMode('offline')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedMode === 'offline'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Offline ({timeSlots.filter(s => s.mode === 'offline').length})
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Time Slots List */}
        {dateKeys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Slots Found</h3>
            <p className="text-gray-600 mb-6">
              {selectedMode === 'all' 
                ? 'No time slots have been created yet.'
                : `No ${selectedMode} time slots found.`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate(`/wellness-guide/class/${classId}/add-recurring-slots`)}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-medium"
              >
                Add Recurring Slots
              </button>
              <button
                onClick={() => navigate(`/wellness-guide/class/${classId}/add-single-slots`)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
              >
                Add Single Slots
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {dateKeys.map((dateKey) => {
              const slots = groupedSlots[dateKey];
              const isExpanded = expandedDates.has(dateKey);
              
              return (
                <div key={dateKey} className="bg-white rounded-lg shadow">
                  {/* Date Header */}
                  <button
                    onClick={() => toggleDateExpansion(dateKey)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="text-left">
                        <h3 className="text-lg font-medium text-gray-900">
                          {formatDate(dateKey)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {slots.length} slot{slots.length !== 1 ? 's' : ''} • 
                          {slots.filter(s => s.mode === 'online').length} online • 
                          {slots.filter(s => s.mode === 'offline').length} offline
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 flex space-x-1">
                        {slots.slice(0, 3).map((slot, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              slot.mode === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {formatTime(slot.startTime)}
                          </span>
                        ))}
                        {slots.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{slots.length - 3}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Slots */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {slots.map((slot) => (
                          <div
                            key={slot._id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-lg mr-3 ${
                                  slot.mode === 'online' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  {getModeIcon(slot.mode)}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 capitalize">
                                    {slot.mode} Session
                                  </h4>
                                  <p className="text-lg font-semibold text-gray-900">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSlotStatusColor(slot)}`}>
                                {getSlotStatus(slot)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Price:</span>
                                <p className="font-medium text-gray-900">₹{slot.price}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Capacity:</span>
                                <p className="font-medium text-gray-900">
                                  {slot.currentBookings}/{slot.maxCapacity}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Day:</span>
                                <p className="font-medium text-gray-900">{slot.dayOfWeek}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Available:</span>
                                <p className="font-medium text-gray-900">{slot.availableSlots}</p>
                              </div>
                            </div>

                            {slot.mode === 'offline' && classDetails?.modes?.offline?.location && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <span className="text-gray-500 text-sm">Location:</span>
                                <p className="text-sm font-medium text-gray-900">
                                  {classDetails.modes.offline.location}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add Slots Actions */}
        {timeSlots.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add More Time Slots</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/wellness-guide/class/${classId}/add-recurring-slots`)}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 font-medium"
              >
                Add Recurring Slots
              </button>
              <button
                onClick={() => navigate(`/wellness-guide/class/${classId}/add-single-slots`)}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
              >
                Add Single Slots
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTimeSlots; 