import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScheduleExtensionInfo, addRecurringTimeSlots } from '../api/WellnessGuideClassApi';

const AddRecurringSlots = () => {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [extensionInfo, setExtensionInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    selectedDays: [],
    dateRange: {
      startDate: '',
      endDate: ''
    },
    timeSlots: {
      online: [],
      offline: []
    },
    modes: {
      online: { enabled: false },
      offline: { enabled: false }
    }
  });

  // Time slot input states
  const [newOnlineSlot, setNewOnlineSlot] = useState({ startTime: '', endTime: '', maxCapacity: '' });
  const [newOfflineSlot, setNewOfflineSlot] = useState({ startTime: '', endTime: '', maxCapacity: '' });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchExtensionInfo();
  }, [classId]);

  const fetchExtensionInfo = async () => {
    try {
      setLoading(true);
      const response = await getScheduleExtensionInfo(classId);
      setExtensionInfo(response);
      
      // Initialize form with suggested values
      const suggestion = response.extensionSuggestion;
      
      // Smart defaults: if only one mode is available, pre-select it
      // If both are available, let user choose
      const onlineAvailable = response.enabledModes.online;
      const offlineAvailable = response.enabledModes.offline;
      const shouldPreSelectOnline = onlineAvailable && !offlineAvailable;
      const shouldPreSelectOffline = offlineAvailable && !onlineAvailable;
      
      setFormData(prev => ({
        ...prev,
        dateRange: {
          startDate: suggestion.suggestedStartDate,
          endDate: suggestion.suggestedEndDate
        },
        modes: {
          online: { enabled: shouldPreSelectOnline },
          offline: { enabled: shouldPreSelectOffline }
        }
      }));

      // Initialize with original patterns if available
      if (response.originalPatterns.online) {
        setFormData(prev => ({
          ...prev,
          selectedDays: [...new Set([...prev.selectedDays, ...response.originalPatterns.online.selectedDays])],
          timeSlots: {
            ...prev.timeSlots,
            online: response.originalPatterns.online.timeSlots
          }
        }));
      }

      if (response.originalPatterns.offline) {
        setFormData(prev => ({
          ...prev,
          selectedDays: [...new Set([...prev.selectedDays, ...response.originalPatterns.offline.selectedDays])],
          timeSlots: {
            ...prev.timeSlots,
            offline: response.originalPatterns.offline.timeSlots
          }
        }));
      }

    } catch (err) {
      setError(err.message || 'Failed to fetch extension information');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleModeToggle = (mode) => {
    setFormData(prev => ({
      ...prev,
      modes: {
        ...prev.modes,
        [mode]: { enabled: !prev.modes[mode].enabled }
      }
    }));
  };

  const addTimeSlot = (mode) => {
    const newSlot = mode === 'online' ? newOnlineSlot : newOfflineSlot;
    
    if (!newSlot.startTime || !newSlot.endTime) {
      setError('Please enter both start and end times');
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      setError('Start time must be before end time');
      return;
    }

    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [mode]: [...prev.timeSlots[mode], newSlot]
      }
    }));

    // Clear the input
    if (mode === 'online') {
      setNewOnlineSlot({ startTime: '', endTime: '', maxCapacity: '' });
    } else {
      setNewOfflineSlot({ startTime: '', endTime: '', maxCapacity: '' });
    }
    setError('');
  };

  const removeTimeSlot = (mode, index) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: {
        ...prev.timeSlots,
        [mode]: prev.timeSlots[mode].filter((_, i) => i !== index)
      }
    }));
  };

  const validateForm = () => {
    if (formData.selectedDays.length === 0) {
      return 'Please select at least one day';
    }

    if (!formData.dateRange.startDate || !formData.dateRange.endDate) {
      return 'Please select both start and end dates';
    }

    if (new Date(formData.dateRange.startDate) >= new Date(formData.dateRange.endDate)) {
      return 'Start date must be before end date';
    }

    if (!formData.modes.online.enabled && !formData.modes.offline.enabled) {
      return 'Please select at least one mode to add slots for';
    }

    // Check that selected modes have time slots
    const hasOnlineSlots = formData.modes.online.enabled && formData.timeSlots.online.length > 0;
    const hasOfflineSlots = formData.modes.offline.enabled && formData.timeSlots.offline.length > 0;

    if (!hasOnlineSlots && !hasOfflineSlots) {
      if (formData.modes.online.enabled && formData.modes.offline.enabled) {
        return 'Please add time slots for at least one of the selected modes';
      } else if (formData.modes.online.enabled) {
        return 'Please add at least one time slot for online mode';
      } else {
        return 'Please add at least one time slot for offline mode';
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

      const submitData = {
        selectedDays: formData.selectedDays,
        dateRange: formData.dateRange,
        timeSlots: {
          online: formData.modes.online.enabled ? formData.timeSlots.online : [],
          offline: formData.modes.offline.enabled ? formData.timeSlots.offline : []
        },
        modes: formData.modes
      };

      const response = await addRecurringTimeSlots(classId, submitData);
      
      setSuccess(`Successfully created ${response.recurringSchedule.slotsCreated.total} recurring time slots!`);
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/wellness-guide-dashboard');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to create recurring time slots');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule information...</p>
        </div>
      </div>
    );
  }

  if (error && !extensionInfo) {
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
                  Add Recurring Time Slots
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  {extensionInfo?.classTitle || 'Class'}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Schedule Information */}
        {extensionInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Current Schedule Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Schedule</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Original Period:</span>
                  <p className="text-gray-600">
                    {formatDate(extensionInfo.scheduleAnalysis.originalRecurringPeriod.startDate)} - 
                    {formatDate(extensionInfo.scheduleAnalysis.originalRecurringPeriod.endDate)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Slots:</span>
                  <p className="text-gray-600">
                    {extensionInfo.scheduleAnalysis.originalRecurringPeriod.totalSlotsCount}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Latest Slot:</span>
                  <p className="text-gray-600">
                    {formatDate(extensionInfo.scheduleAnalysis.latestSlotDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Extension Rules */}
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
              <h3 className="text-lg font-medium text-yellow-900 mb-4">Extension Rules</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-yellow-800">Earliest Start Date:</span>
                  <p className="text-yellow-700">
                    {formatDate(extensionInfo.recurringExtensionRules.earliestAllowedStartDate)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-yellow-800">Reason:</span>
                  <p className="text-yellow-700">
                    {extensionInfo.recurringExtensionRules.reason}
                  </p>
                </div>
                {extensionInfo.recurringExtensionRules.conflictWarning && (
                  <div className="bg-yellow-100 rounded p-2">
                    <p className="text-yellow-700">
                      {extensionInfo.recurringExtensionRules.conflictWarning}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Suggestion */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Suggestion</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-blue-800">Suggested Period:</span>
                  <p className="text-blue-700">
                    {formatDate(extensionInfo.extensionSuggestion.suggestedStartDate)} - 
                    {formatDate(extensionInfo.extensionSuggestion.suggestedEndDate)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-blue-800">Potential Slots:</span>
                  <p className="text-blue-700">
                    {extensionInfo.extensionSuggestion.totalPotentialSlotsCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date Range */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Date Range</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={formData.dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  min={extensionInfo?.recurringExtensionRules?.earliestAllowedStartDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={formData.dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={formData.dateRange.startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Days Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Days *</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {weekDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`p-3 rounded-md border text-sm font-medium transition-colors ${
                    formData.selectedDays.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Choose Modes for Recurring Slots *</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which mode(s) you want to add recurring time slots for. You can choose one or both modes.
              {extensionInfo?.enabledModes?.online && extensionInfo?.enabledModes?.offline && (
                <span className="font-medium text-blue-600"> Both modes are available for your class.</span>
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {extensionInfo?.enabledModes?.online && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="online-mode"
                      checked={formData.modes.online.enabled}
                      onChange={() => handleModeToggle('online')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="online-mode" className="ml-2 block text-sm font-medium text-gray-900">
                      Add Online Recurring Slots
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Create recurring online sessions for the selected date range and days
                  </p>
                </div>
              )}
              {extensionInfo?.enabledModes?.offline && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="offline-mode"
                      checked={formData.modes.offline.enabled}
                      onChange={() => handleModeToggle('offline')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="offline-mode" className="ml-2 block text-sm font-medium text-gray-900">
                      Add Offline Recurring Slots
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 ml-6">
                    Create recurring offline sessions for the selected date range and days
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Online Time Slots */}
            {formData.modes.online.enabled && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Online Time Slots</h3>
                
                {/* Add New Online Slot */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="time"
                      value={newOnlineSlot.startTime}
                      onChange={(e) => setNewOnlineSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Start time"
                    />
                    <input
                      type="time"
                      value={newOnlineSlot.endTime}
                      onChange={(e) => setNewOnlineSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="End time"
                    />
                    <input
                      type="number"
                      value={newOnlineSlot.maxCapacity}
                      onChange={(e) => setNewOnlineSlot(prev => ({ ...prev, maxCapacity: e.target.value }))}
                      min="1"
                      max="1000"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Capacity (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => addTimeSlot('online')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Leave capacity empty to use default capacity for online mode.
                  </p>
                </div>

                {/* Online Slots List */}
                <div className="space-y-2">
                  {formData.timeSlots.online.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-md">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-blue-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {slot.maxCapacity && (
                          <span className="text-xs text-blue-700 ml-2">
                            (Capacity: {slot.maxCapacity})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot('online', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Offline Time Slots */}
            {formData.modes.offline.enabled && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">Offline Time Slots</h3>
                
                {/* Add New Offline Slot */}
                <div className="mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="time"
                      value={newOfflineSlot.startTime}
                      onChange={(e) => setNewOfflineSlot(prev => ({ ...prev, startTime: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Start time"
                    />
                    <input
                      type="time"
                      value={newOfflineSlot.endTime}
                      onChange={(e) => setNewOfflineSlot(prev => ({ ...prev, endTime: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="End time"
                    />
                    <input
                      type="number"
                      value={newOfflineSlot.maxCapacity}
                      onChange={(e) => setNewOfflineSlot(prev => ({ ...prev, maxCapacity: e.target.value }))}
                      min="1"
                      max="1000"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Capacity (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => addTimeSlot('offline')}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 whitespace-nowrap"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Leave capacity empty to use default capacity for offline mode.
                  </p>
                </div>

                {/* Offline Slots List */}
                <div className="space-y-2">
                  {formData.timeSlots.offline.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-green-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                        {slot.maxCapacity && (
                          <span className="text-xs text-green-700 ml-2">
                            (Capacity: {slot.maxCapacity})
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTimeSlot('offline', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                <p>
                  This will create recurring time slots for the selected days and time periods.
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
                {submitting ? 'Creating Slots...' : 'Create Recurring Slots'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecurringSlots; 