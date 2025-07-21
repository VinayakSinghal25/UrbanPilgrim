// src/components/User/ExperienceBooking/DateTimeSelector.jsx
import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline';

const DateTimeSelector = ({ experience, onSlotSelect, selectedSlots = [] }) => {
  const [expandedDates, setExpandedDates] = useState({});

  const toggleDateExpansion = (dateId) => {
    setExpandedDates(prev => ({
      ...prev,
      [dateId]: !prev[dateId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    // Convert 24-hour format to 12-hour format if needed
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isSlotSelected = (dateId, slotId) => {
    return selectedSlots.some(slot => 
      slot.dateId === dateId && slot.slotId === slotId
    );
  };

  const handleSlotToggle = (date, timeSlot) => {
    const slotInfo = {
      dateId: date._id,
      slotId: timeSlot._id,
      date: date.date,
      dayOfWeek: date.dayOfWeek,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      capacity: timeSlot.capacity,
      experienceId: experience._id,
      experienceName: experience.name,
      price: experience.price
    };

    onSlotSelect(slotInfo);
  };

  if (!experience.availableDates || experience.availableDates.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No available dates for this experience at the moment.</p>
      </div>
    );
  }

  const activeDates = experience.availableDates.filter(date => date.isActive);

  if (activeDates.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No active dates available for booking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date & Time</h3>
      
      {activeDates.map((date) => (
        <div key={date._id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Date Header */}
          <button
            onClick={() => toggleDateExpansion(date._id)}
            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
          >
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{formatDate(date.date)}</p>
                <p className="text-sm text-gray-600">{date.dayOfWeek}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {date.timeSlots.length} slots available
              </span>
              <svg
                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                  expandedDates[date._id] ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* Time Slots */}
          {expandedDates[date._id] && (
            <div className="p-4 space-y-3">
              {date.timeSlots.map((timeSlot) => {
                const isSelected = isSlotSelected(date._id, timeSlot._id);
                
                return (
                  <div
                    key={timeSlot._id}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                        : 'border-gray-200 hover:border-amber-300 hover:bg-amber-25'
                    }`}
                    onClick={() => handleSlotToggle(date, timeSlot)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-900">
                          {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          <span>{timeSlot.capacity} spots</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            ₹{experience.price?.toLocaleString()}
                          </span>
                        </div>
                        
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DateTimeSelector;