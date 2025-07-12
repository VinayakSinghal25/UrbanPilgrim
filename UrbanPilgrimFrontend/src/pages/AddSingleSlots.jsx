import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClassDetails, addTimeSlots } from '../api/WellnessGuideClassApi';

const AddSingleSlots = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [classDetails, setClassDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    slots: [{
      date: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      mode: 'online',
      maxCapacity: ''
    }]
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchClassDetails();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await getClassDetails(classId);
      setClassDetails(response.classDetails);
      
      // Set default mode based on what's enabled
      if (response.classDetails.modes?.online?.enabled) {
        setFormData(prev => ({
          ...prev,
          slots: prev.slots.map(slot => ({ ...slot, mode: 'online', maxCapacity: '' }))
        }));
      } else if (response.classDetails.modes?.offline?.enabled) {
        setFormData(prev => ({
          ...prev,
          slots: prev.slots.map(slot => ({ ...slot, mode: 'offline', maxCapacity: '' }))
        }));
      }
      
    } catch (err) {
      setError(err.message || 'Failed to fetch class details');
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (dateString) => {
    const date = new Date(dateString);
    return weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1]; // Adjust for Monday start
  };

  const handleSlotChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.map((slot, i) => {
        if (i === index) {
          const updatedSlot = { ...slot, [field]: value };
          // Auto-calculate dayOfWeek when date changes
          if (field === 'date' && value) {
            updatedSlot.dayOfWeek = getDayOfWeek(value);
          }
          return updatedSlot;
        }
        return slot;
      })
    }));
  };

  const addSlot = () => {
    const defaultMode = classDetails?.modes?.online?.enabled ? 'online' : 'offline';
    setFormData(prev => ({
      ...prev,
      slots: [...prev.slots, {
        date: '',
        dayOfWeek: '',
        startTime: '',
        endTime: '',
        mode: defaultMode,
        maxCapacity: ''
      }]
    }));
  };

  const removeSlot = (index) => {
    if (formData.slots.length > 1) {
      setFormData(prev => ({
        ...prev,
        slots: prev.slots.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    for (let i = 0; i < formData.slots.length; i++) {
      const slot = formData.slots[i];
      
      if (!slot.date) {
        return `Please select a date for slot ${i + 1}`;
      }
      
      if (!slot.startTime) {
        return `Please select a start time for slot ${i + 1}`;
      }
      
      if (!slot.endTime) {
        return `Please select an end time for slot ${i + 1}`;
      }
      
      if (slot.startTime >= slot.endTime) {
        return `Start time must be before end time for slot ${i + 1}`;
      }
      
      // Check if date is in the past
      const slotDate = new Date(slot.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (slotDate < today) {
        return `Date for slot ${i + 1} cannot be in the past`;
      }
      
      // Check if selected mode is enabled
      if (slot.mode === 'online' && !classDetails?.modes?.online?.enabled) {
        return `Online mode is not enabled for this class`;
      }
      
      if (slot.mode === 'offline' && !classDetails?.modes?.offline?.enabled) {
        return `Offline mode is not enabled for this class`;
      }
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Filter out empty slots and prepare data
      const validSlots = formData.slots.filter(slot => 
        slot.date && slot.startTime && slot.endTime
      );

      console.log('🔍 Valid slots to submit:', validSlots);

      if (validSlots.length === 0) {
        setError('Please add at least one valid time slot');
        return;
      }

      // Group slots by mode
      const onlineSlots = validSlots.filter(slot => slot.mode === 'online');
      const offlineSlots = validSlots.filter(slot => slot.mode === 'offline');

      console.log('📊 Online slots:', onlineSlots);
      console.log('📊 Offline slots:', offlineSlots);

      // Submit online slots
      if (onlineSlots.length > 0) {
        const onlinePayload = {
          newSlots: onlineSlots.map(slot => ({
            date: slot.date,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            ...(slot.maxCapacity && { maxCapacity: parseInt(slot.maxCapacity) })
          })),
          mode: 'online'
        };
        console.log('🟦 Submitting online slots payload:', onlinePayload);
        
        const onlineResponse = await addTimeSlots(classId, onlinePayload);
        console.log('✅ Online slots response:', onlineResponse);
      }

      // Submit offline slots
      if (offlineSlots.length > 0) {
        const offlinePayload = {
          newSlots: offlineSlots.map(slot => ({
            date: slot.date,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            ...(slot.maxCapacity && { maxCapacity: parseInt(slot.maxCapacity) })
          })),
          mode: 'offline'
        };
        console.log('🟩 Submitting offline slots payload:', offlinePayload);
        
        const offlineResponse = await addTimeSlots(classId, offlinePayload);
        console.log('✅ Offline slots response:', offlineResponse);
      }

      setSuccess(`Successfully added ${validSlots.length} time slot(s)!`);
      
      // Reset form
      setFormData({
        slots: [{
          date: '',
          dayOfWeek: '',
          startTime: '',
          endTime: '',
          mode: classDetails?.modes?.online?.enabled ? 'online' : 'offline',
          maxCapacity: ''
        }]
      });

      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/wellness-guide-dashboard');
      }, 2000);

    } catch (err) {
      console.error('❌ Error adding time slots:', err);
      setError(err.message || 'Failed to add time slots');
    } finally {
      setSubmitting(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error && !classDetails) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Add Single Time Slots
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Class Information */}
        {classDetails && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Class Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Modes Available:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {classDetails.modes?.online?.enabled && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Online (₹{classDetails.modes.online.price}, max {classDetails.modes.online.maxCapacity})
                    </span>
                  )}
                  {classDetails.modes?.offline?.enabled && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Offline (₹{classDetails.modes.offline.price}, max {classDetails.modes.offline.maxCapacity})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Difficulty:</span>
                <p className="text-gray-600">{classDetails.difficulty}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Timezone:</span>
                <p className="text-gray-600">{classDetails.timezone}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Single Time Slots</h4>
              <p className="text-sm text-blue-700 mt-1">
                Add individual time slots for specific dates. You can choose any available mode for each slot 
                (online or offline). These slots will be validated for conflicts when you submit.
                Mix and match modes based on your needs for each specific date.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Time Slots */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Time Slots</h3>
              <button
                type="button"
                onClick={addSlot}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Add Another Slot
              </button>
            </div>

            <div className="space-y-4">
              {formData.slots.map((slot, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Slot {index + 1}
                    </h4>
                    {formData.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => handleSlotChange(index, 'date', e.target.value)}
                        min={getTomorrowDate()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>

                    {/* Day of Week (Auto-calculated) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Day
                      </label>
                      <input
                        type="text"
                        value={slot.dayOfWeek}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        placeholder="Auto-calculated"
                      />
                    </div>

                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotChange(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotChange(index, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                      />
                    </div>

                    {/* Capacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={slot.maxCapacity}
                        onChange={(e) => handleSlotChange(index, 'maxCapacity', e.target.value)}
                        min="1"
                        max="1000"
                        placeholder={`Default: ${slot.mode === 'online' 
                          ? classDetails?.modes?.online?.maxCapacity || 'N/A'
                          : classDetails?.modes?.offline?.maxCapacity || 'N/A'
                        }`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Mode Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode *
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {classDetails?.modes?.online?.enabled && (
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`online-${index}`}
                            name={`mode-${index}`}
                            value="online"
                            checked={slot.mode === 'online'}
                            onChange={(e) => handleSlotChange(index, 'mode', e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={`online-${index}`} className="ml-2 text-sm text-gray-900">
                            Online (₹{classDetails.modes.online.price}, default capacity: {classDetails.modes.online.maxCapacity})
                          </label>
                        </div>
                      )}
                      {classDetails?.modes?.offline?.enabled && (
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id={`offline-${index}`}
                            name={`mode-${index}`}
                            value="offline"
                            checked={slot.mode === 'offline'}
                            onChange={(e) => handleSlotChange(index, 'mode', e.target.value)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                          />
                          <label htmlFor={`offline-${index}`} className="ml-2 text-sm text-gray-900">
                            Offline (₹{classDetails.modes.offline.price}, default capacity: {classDetails.modes.offline.maxCapacity})
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Leave capacity empty to use the default capacity for the selected mode.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <p>
                  Time slots will be validated for conflicts when you submit. 
                  If conflicts are found, you'll be notified with details.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`px-8 py-3 rounded-md font-medium text-white transition-colors ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? 'Adding Slots...' : 'Add Time Slots'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSingleSlots; 