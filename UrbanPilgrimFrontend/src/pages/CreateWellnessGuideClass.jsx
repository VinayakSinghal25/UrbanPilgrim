import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllSpecialties } from '../api/wellnessGuideApi';
import { getMyAddresses, createWellnessGuideClass } from '../api/WellnessGuideClassApi';

// Custom styles for extra small breakpoint
const customStyles = `
  @media (min-width: 475px) {
    .xs\\:inline { display: inline !important; }
    .xs\\:hidden { display: none !important; }
    .xs\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
  }
`;

const CreateWellnessGuideClass = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Form state with separate schedule configurations
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialty: '',
    difficulty: 'Beginner',
    timezone: 'Asia/Kolkata',
    tags: [],
    tagsInput: '',
    guideCertifications: [''],
    skillsToLearn: [''],
    aboutSections: [{ header: '', paragraph: '' }],
    modes: {
      online: { enabled: false, maxCapacity: '', price: '' },
      offline: { enabled: false, maxCapacity: '', price: '' }
    },
    // NEW: Separate schedule configurations
    scheduleConfig: {
      online: {
        selectedDays: [],
        timeSlots: [],
        dateRange: { startDate: '', endDate: '' }
      },
      offline: {
        selectedDays: [],
        timeSlots: [],
        dateRange: { startDate: '', endDate: '' }
      }
    },
    selectedAddress: null, // Store the complete address object
    newAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      landmark: '',
      addressType: 'studio'
    },
    isNewAddress: false,
    offlineLocation: ''
  });

  const [photos, setPhotos] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scheduleRequestId, setScheduleRequestId] = useState(null);

  const totalSteps = 7; // Updated to 7 steps
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const addressTypes = ['home', 'office', 'studio', 'gym', 'other'];
  
  // Common timezones for India and nearby regions
  const commonTimezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India Standard Time - IST)' },
    { value: 'Asia/Dubai', label: 'Asia/Dubai (UAE Standard Time - GST)' },
    { value: 'Asia/Singapore', label: 'Asia/Singapore (Singapore Standard Time - SST)' },
    { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (Hong Kong Time - HKT)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan Standard Time - JST)' },
    { value: 'Europe/London', label: 'Europe/London (Greenwich Mean Time - GMT)' },
    { value: 'America/New_York', label: 'America/New_York (Eastern Standard Time - EST)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific Standard Time - PST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (Australian Eastern Time - AEST)' }
  ];

  const stepTitles = [
    'Basic Information',
    'Certifications & Skills (Optional)', 
    'Tell Us More (Optional)',
    'Modes & Pricing',
    'Online Schedule',
    'Offline Schedule', 
    'Photos & Review'
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [specialtiesData, addressesData] = await Promise.all([
        getAllSpecialties(),
        getMyAddresses()
      ]);
      setSpecialties(specialtiesData);
      setAddresses(addressesData.addresses || []);
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleAboutSectionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      aboutSections: prev.aboutSections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const handleModeChange = (mode, field, value) => {
    setFormData(prev => ({
      ...prev,
      modes: {
        ...prev.modes,
        [mode]: { ...prev.modes[mode], [field]: value }
      }
    }));
  };

  // NEW: Separate handlers for online/offline schedule configurations
  const handleScheduleDayToggle = (mode, day) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [mode]: {
          ...prev.scheduleConfig[mode],
          selectedDays: prev.scheduleConfig[mode].selectedDays.includes(day)
            ? prev.scheduleConfig[mode].selectedDays.filter(d => d !== day)
            : [...prev.scheduleConfig[mode].selectedDays, day]
        }
      }
    }));
  };

  const handleScheduleDateChange = (mode, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [mode]: {
          ...prev.scheduleConfig[mode],
          dateRange: {
            ...prev.scheduleConfig[mode].dateRange,
            [field]: value
          }
        }
      }
    }));
  };

  const handleTimeSlotChange = (mode, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [mode]: {
          ...prev.scheduleConfig[mode],
          timeSlots: prev.scheduleConfig[mode].timeSlots.map((slot, i) => 
            i === index ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const addTimeSlot = (mode) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [mode]: {
          ...prev.scheduleConfig[mode],
          timeSlots: [...prev.scheduleConfig[mode].timeSlots, { startTime: '', endTime: '' }]
        }
      }
    }));
  };

  const removeTimeSlot = (mode, index) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [mode]: {
          ...prev.scheduleConfig[mode],
          timeSlots: prev.scheduleConfig[mode].timeSlots.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      newAddress: { ...prev.newAddress, [field]: value }
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      setError('You can upload maximum 5 photos');
      return;
    }
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, tagsInput: value }));
    
    // Only update tags array when there are commas or on blur
    if (value.includes(',')) {
      const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
      setFormData(prev => ({ ...prev, tags: tagsArray, tagsInput: '' }));
    }
  };

  const handleTagsBlur = () => {
    // Process any remaining text when user leaves the field
    if (formData.tagsInput && formData.tagsInput.trim()) {
      const newTag = formData.tagsInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({ 
          ...prev, 
          tags: [...prev.tags, newTag],
          tagsInput: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, tagsInput: '' }));
      }
    }
  };

  const handleTagsKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagsBlur();
    }
  };



  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.specialty;
      
      case 2:
        // Both certifications and skills are optional, so always return true
        return true;
      
      case 3:
        // About sections are optional, so always return true
        return true;
      
      case 4:
        const modesValid = (formData.modes.online.enabled || formData.modes.offline.enabled);
        const onlineValid = !formData.modes.online.enabled || 
          (formData.modes.online.maxCapacity && formData.modes.online.price);
        
        // Enhanced offline validation with debugging
        let offlineValid = true;
        if (formData.modes.offline.enabled) {
          // Check basic pricing requirements
          const hasPricing = formData.modes.offline.maxCapacity && formData.modes.offline.price;
          
          // Check address requirements
          let hasAddress = false;
          if (formData.isNewAddress) {
            // For new address, check required fields
            hasAddress = formData.newAddress.street && formData.newAddress.city && 
                        formData.newAddress.state && formData.newAddress.zipCode;
          } else {
            // For existing address, must have selected one
            hasAddress = formData.selectedAddress && formData.selectedAddress.street && 
                        formData.selectedAddress.city && formData.selectedAddress.state && 
                        (formData.selectedAddress.zipCode || formData.selectedAddress.pincode);
          }
          
          // Check location is provided
          const hasLocation = formData.offlineLocation && formData.offlineLocation.trim();
          
          // DEBUG: Log validation details
          console.log('DEBUG - Step 4 Offline Validation:');
          console.log('  hasPricing:', hasPricing, '(capacity:', formData.modes.offline.maxCapacity, ', price:', formData.modes.offline.price, ')');
          console.log('  hasLocation:', hasLocation, '(location:', formData.offlineLocation, ')');
          console.log('  hasAddress:', hasAddress);
          console.log('  isNewAddress:', formData.isNewAddress);
          console.log('  selectedAddress:', formData.selectedAddress);
          console.log('  newAddress:', formData.newAddress);
          
          offlineValid = hasPricing && hasAddress && hasLocation;
          console.log('  offlineValid:', offlineValid);
        }
        
        const result = modesValid && onlineValid && offlineValid;
        console.log('DEBUG - Step 4 Final Validation:', result, '(modesValid:', modesValid, ', onlineValid:', onlineValid, ', offlineValid:', offlineValid, ')');
        return result;
      
      case 5: // Online Schedule
        if (!formData.modes.online.enabled) return true; // Skip if not enabled
        const onlineSchedule = formData.scheduleConfig.online;
        return onlineSchedule.selectedDays.length > 0 && 
               onlineSchedule.dateRange.startDate && onlineSchedule.dateRange.endDate &&
               onlineSchedule.timeSlots.length > 0 &&
               onlineSchedule.timeSlots.every(slot => slot.startTime && slot.endTime);
      
      case 6: // Offline Schedule  
        if (!formData.modes.offline.enabled) return true; // Skip if not enabled
        const offlineSchedule = formData.scheduleConfig.offline;
        return offlineSchedule.selectedDays.length > 0 && 
               offlineSchedule.dateRange.startDate && offlineSchedule.dateRange.endDate &&
               offlineSchedule.timeSlots.length > 0 &&
               offlineSchedule.timeSlots.every(slot => slot.startTime && slot.endTime);
      
      case 7: // Photos & Review
        return photos.length > 0; // At least one photo required
      
      default:
        return true;
    }
  };

  const getStepValidationMessage = (step) => {
    switch (step) {
      case 1:
        return 'Please fill in title, description, and select a specialty';
      case 2:
        return 'Certifications and skills are optional - you can skip this step or add more details';
      case 3:
        return 'About sections are optional - you can skip this step or add more details';
      case 4:
        if (!formData.modes.online.enabled && !formData.modes.offline.enabled) {
          return 'Please enable at least one mode (online or offline)';
        }
        if (formData.modes.online.enabled && (!formData.modes.online.maxCapacity || !formData.modes.online.price)) {
          return 'Please provide capacity and price for online mode';
        }
        if (formData.modes.offline.enabled) {
          console.log('DEBUG - Validation Message Check:');
          console.log('  maxCapacity:', formData.modes.offline.maxCapacity);
          console.log('  price:', formData.modes.offline.price);
          console.log('  offlineLocation:', formData.offlineLocation);
          console.log('  isNewAddress:', formData.isNewAddress);
          console.log('  selectedAddress:', formData.selectedAddress);
          
          if (!formData.modes.offline.maxCapacity || !formData.modes.offline.price) {
            return 'Please provide capacity and price for offline mode';
          }
          if (!formData.offlineLocation || !formData.offlineLocation.trim()) {
            return 'Please provide a location (city) for offline mode';
          }
          if (formData.isNewAddress) {
            if (!formData.newAddress.street || !formData.newAddress.city || !formData.newAddress.state || !formData.newAddress.zipCode) {
              return 'Please fill in all required address fields for offline mode';
            }
          } else {
            if (!formData.selectedAddress || !formData.selectedAddress.street || 
                !formData.selectedAddress.city || !formData.selectedAddress.state || 
                (!formData.selectedAddress.zipCode && !formData.selectedAddress.pincode)) {
              console.log('DEBUG - Address validation failed');
              return 'Please select an existing address or choose to add a new one for offline mode';
            }
          }
        }
        return 'Please complete all required fields for selected modes';
      case 5:
        return 'Please configure complete online schedule: select days, date range, and time slots';
      case 6:
        return 'Please configure complete offline schedule: select days, date range, and time slots';
      case 7:
        return 'Please upload at least one photo to showcase your class';
      default:
        return 'Please complete all required fields';
    }
  };

  const nextStep = () => {
    // Skip steps for disabled modes
    if (currentStep === 5 && !formData.modes.online.enabled) {
      setCurrentStep(6);
      return;
    }
    if (currentStep === 6 && !formData.modes.offline.enabled) {
      setCurrentStep(7);
      return;
    }

    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    } else {
      setError(getStepValidationMessage(currentStep));
    }
  };

  const prevStep = () => {
    let targetStep = currentStep - 1;
    
    // Skip steps for disabled modes when going back
    if (targetStep === 6 && !formData.modes.offline.enabled) {
      targetStep = 5;
    }
    if (targetStep === 5 && !formData.modes.online.enabled) {
      targetStep = 4;
    }
    
    setCurrentStep(Math.max(targetStep, 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      setError(getStepValidationMessage(currentStep));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('specialty', formData.specialty);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('timezone', formData.timezone);
      
      // JSON fields
      submitData.append('guideCertifications', JSON.stringify(formData.guideCertifications.filter(cert => cert.trim())));
      submitData.append('skillsToLearn', JSON.stringify(formData.skillsToLearn.filter(skill => skill.trim())));
      submitData.append('aboutSections', JSON.stringify(formData.aboutSections));
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('modes', JSON.stringify(formData.modes));
      
      // NEW: Submit separate schedule configurations
      submitData.append('scheduleConfig', JSON.stringify(formData.scheduleConfig));
      
      // Address handling - ensure proper submission
      submitData.append('isNewAddress', formData.isNewAddress.toString());
      
      if (formData.isNewAddress) {
        // Validate new address before sending
        if (!formData.newAddress.street || !formData.newAddress.city || !formData.newAddress.state || !formData.newAddress.zipCode) {
          throw new Error('Please complete all required address fields');
        }
        submitData.append('newAddress', JSON.stringify(formData.newAddress));
      } else {
        // Validate existing address selection and send complete address
        if (!formData.selectedAddress || !formData.selectedAddress.street) {
          throw new Error('Please select an existing address');
        }
        // Send the complete address object instead of just ID
        submitData.append('selectedAddress', JSON.stringify(formData.selectedAddress));
      }
      
      // Offline location (for offline mode only)
      if (formData.modes.offline.enabled) {
        if (!formData.offlineLocation || !formData.offlineLocation.trim()) {
          throw new Error('Please provide a location (city) for offline mode');
        }
        submitData.append('offlineLocation', formData.offlineLocation.trim());
      }
      
      // Photos
      photos.forEach((photo) => {
        submitData.append('photos', photo);
      });

      const response = await createWellnessGuideClass(submitData);
      setScheduleRequestId(response.scheduleRequestId);
      setShowSuccess(true);
      
    } catch (err) {
      setError(err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowSuccess(false);
    setCurrentStep(1);
    setScheduleRequestId(null);
    setFormData({
      title: '', description: '', specialty: '', difficulty: 'Beginner',
      timezone: 'Asia/Kolkata', tags: [], tagsInput: '', guideCertifications: [''], 
      skillsToLearn: [''], aboutSections: [{ header: '', paragraph: '' }],
      modes: { 
        online: { enabled: false, maxCapacity: '', price: '' }, 
        offline: { enabled: false, maxCapacity: '', price: '' } 
      },
      scheduleConfig: {
        online: { selectedDays: [], timeSlots: [], dateRange: { startDate: '', endDate: '' } },
        offline: { selectedDays: [], timeSlots: [], dateRange: { startDate: '', endDate: '' } }
      },
      selectedAddress: null,
      newAddress: { 
        street: '', city: '', state: '', zipCode: '', country: 'India', 
        landmark: '', addressType: 'studio' 
      }, 
      isNewAddress: false,
      offlineLocation: ''
    });
    setPhotos([]);
  };

  // Success Screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Class Submitted Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your wellness class has been submitted! Time slots and photos are being processed in the background. 
            Once approved by admin, it will be visible on your profile and students can start booking.
          </p>
          {scheduleRequestId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-blue-700">
                Request ID: <span className="font-mono">{scheduleRequestId}</span>
              </p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/wellness-guide-dashboard')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper component for step indicators
  const StepIndicator = ({ step, isActive, isCompleted, isAccessible }) => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
      isCompleted ? 'bg-green-600 text-white' :
      isActive ? 'bg-blue-600 text-white' :
      isAccessible ? 'bg-gray-300 text-gray-600 hover:bg-gray-400' :
      'bg-gray-200 text-gray-400'
    }`}>
      {isCompleted ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      ) : step}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-0">Create Wellness Class</h1>
            <button
              onClick={() => navigate('/wellness-guide-dashboard')}
              className="self-end sm:self-auto text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close and return to dashboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {[1, 2, 3, 4, 5, 6, 7].map((step) => {
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;
                const isAccessible = step <= currentStep;
                
                // Skip indicators for disabled modes
                const shouldShow = step !== 5 || formData.modes.online.enabled;
                const shouldShowOffline = step !== 6 || formData.modes.offline.enabled;
                
                if (!shouldShow || !shouldShowOffline) {
                  return (
                    <React.Fragment key={step}>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium bg-gray-100 text-gray-400 flex-shrink-0">
                        —
                      </div>
                      {step < 7 && (
                        <div className="flex-1 h-1 mx-1 sm:mx-2 bg-gray-300 min-w-[16px] sm:min-w-[24px]"></div>
                      )}
                    </React.Fragment>
                  );
                }

                return (
                  <React.Fragment key={step}>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isActive ? 'bg-blue-600 text-white' :
                      isAccessible ? 'bg-gray-300 text-gray-600 hover:bg-gray-400' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : step}
                    </div>
                    {step < 7 && (
                      <div className={`flex-1 h-1 mx-1 sm:mx-2 transition-colors min-w-[16px] sm:min-w-[24px] ${
                        step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-gray-600">
            Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Stress Relief Yoga for Beginners"
                    maxLength="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your class - what will participants learn, what makes it special, what to expect..."
                    maxLength="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialty *
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select specialty</option>
                      {specialties.map((specialty) => (
                        <option key={specialty._id} value={specialty._id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {difficulties.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {commonTimezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Your timezone affects class scheduling. Default is India Standard Time.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tagsInput}
                    onChange={handleTagsChange}
                    onBlur={handleTagsBlur}
                    onKeyPress={handleTagsKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., yoga, stress relief, breathing, meditation"
                  />
                  <p className="text-xs text-gray-500 mt-1">Type multiple tags separated by commas. Example: "yoga, stress relief, breathing"</p>
                  
                  {/* Show current tags */}
                  {formData.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          <span className="truncate max-w-[120px] sm:max-w-none">{tag}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = formData.tags.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, tags: newTags }));
                            }}
                            className="ml-1 sm:ml-2 inline-flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors"
                            aria-label={`Remove ${tag} tag`}
                          >
                            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Certifications & Skills */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications & Skills (Optional)</h2>
                <p className="text-sm text-gray-500 mb-4">Add your certifications and skills to build trust with students</p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Certifications
                  </label>
                  <p className="text-sm text-gray-500 mb-3">List your relevant certifications and credentials (optional)</p>
                  {formData.guideCertifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleArrayChange('guideCertifications', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Certified Yoga Instructor (RYT 200)"
                      />
                      {formData.guideCertifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('guideCertifications', index)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remove certification"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('guideCertifications')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    + Add Another Certification
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Students Will Learn
                  </label>
                  <p className="text-sm text-gray-500 mb-3">What specific skills or knowledge will participants gain? (optional)</p>
                  {formData.skillsToLearn.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('skillsToLearn', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Deep breathing techniques"
                      />
                      {formData.skillsToLearn.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('skillsToLearn', index)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Remove skill"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('skillsToLearn')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    + Add Another Skill
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: About Sections */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tell Us More About Your Class</h2>
                <p className="text-sm text-gray-500 mb-4">Create detailed sections with specific topics to help students understand your class better (Optional)</p>
                
                {formData.aboutSections.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Section {index + 1}</h3>
                      {formData.aboutSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('aboutSections', index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Section Header *
                        </label>
                        <input
                          type="text"
                          value={section.header}
                          onChange={(e) => handleAboutSectionChange(index, 'header', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., What You'll Learn"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content *
                        </label>
                        <textarea
                          value={section.paragraph}
                          onChange={(e) => handleAboutSectionChange(index, 'paragraph', e.target.value)}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Detailed content for this section..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('aboutSections', { header: '', paragraph: '' })}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
                >
                  + Add Another Section
                </button>
              </div>
            )}

            {/* Step 4: Modes & Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Modes & Pricing</h2>
                <p className="text-sm text-gray-500 mb-4">Configure how you want to offer your classes</p>
                
                {/* Online Mode */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={formData.modes.online.enabled}
                      onChange={(e) => handleModeChange('online', 'enabled', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Online Classes</h3>
                      <p className="text-sm text-gray-500">Conduct classes via video conferencing</p>
                    </div>
                  </div>
                  
                  {formData.modes.online.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Capacity *
                        </label>
                        <input
                          type="number"
                          value={formData.modes.online.maxCapacity}
                          onChange={(e) => handleModeChange('online', 'maxCapacity', parseInt(e.target.value) || '')}
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price per Session (₹) *
                        </label>
                        <input
                          type="number"
                          value={formData.modes.online.price}
                          onChange={(e) => handleModeChange('online', 'price', parseInt(e.target.value) || '')}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Offline Mode */}
                <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={formData.modes.offline.enabled}
                      onChange={(e) => handleModeChange('offline', 'enabled', e.target.checked)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Offline Classes</h3>
                      <p className="text-sm text-gray-500">In-person classes at a physical location</p>
                    </div>
                  </div>
                  
                  {formData.modes.offline.enabled && (
                    <div className="space-y-4 bg-green-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Capacity *
                          </label>
                          <input
                            type="number"
                            value={formData.modes.offline.maxCapacity}
                            onChange={(e) => handleModeChange('offline', 'maxCapacity', parseInt(e.target.value) || '')}
                            min="1"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 15"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price per Session (₹) *
                          </label>
                          <input
                            type="number"
                            value={formData.modes.offline.price}
                            onChange={(e) => handleModeChange('offline', 'price', parseInt(e.target.value) || '')}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., 800"
                          />
                        </div>
                      </div>

                      {/* Location Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location (City) *
                        </label>
                        <input
                          type="text"
                          value={formData.offlineLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, offlineLocation: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Mumbai, Delhi, Bangalore"
                        />
                        <p className="text-xs text-gray-500 mt-1">This helps students find classes in their city</p>
                      </div>

                      {/* Address Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Address *
                        </label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="addressOption"
                              checked={!formData.isNewAddress}
                              onChange={() => setFormData(prev => ({ ...prev, isNewAddress: false }))}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm font-medium">Use existing address</span>
                          </div>
                          
                          {!formData.isNewAddress && (
                            <select
                              value={formData.selectedAddress ? (formData.selectedAddress._id || formData.selectedAddress.id || '') : ''}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                const selectedAddr = addresses.find(addr => (addr._id || addr.id) === selectedId);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  selectedAddress: selectedAddr || null
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">Select an address</option>
                              {addresses.map((address, index) => (
                                <option key={address._id || address.id || index} value={address._id || address.id || index}>
                                  {address.street}, {address.city}, {address.state}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="addressOption"
                              checked={formData.isNewAddress}
                              onChange={() => setFormData(prev => ({ ...prev, isNewAddress: true }))}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-sm font-medium">Add new address</span>
                          </div>
                          
                          {formData.isNewAddress && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.street}
                                  onChange={(e) => handleAddressChange('street', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Street address"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.city}
                                  onChange={(e) => handleAddressChange('city', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="City"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.state}
                                  onChange={(e) => handleAddressChange('state', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="State"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.zipCode}
                                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Zip Code"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.landmark}
                                  onChange={(e) => handleAddressChange('landmark', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Nearby landmark"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                                <select
                                  value={formData.newAddress.addressType}
                                  onChange={(e) => handleAddressChange('addressType', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {addressTypes.map((type) => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Online Schedule Configuration */}
            {currentStep === 5 && formData.modes.online.enabled && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Online Schedule Configuration</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure when your online classes will run</p>
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Days for Online Classes *
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {days.map((day) => (
                      <label key={day} className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.scheduleConfig.online.selectedDays.includes(day)}
                          onChange={() => handleScheduleDayToggle('online', day)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium truncate">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleConfig.online.dateRange.startDate}
                      onChange={(e) => handleScheduleDateChange('online', 'startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleConfig.online.dateRange.endDate}
                      onChange={(e) => handleScheduleDateChange('online', 'endDate', e.target.value)}
                      min={formData.scheduleConfig.online.dateRange.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <h3 className="text-lg font-medium text-gray-900">Online Time Slots *</h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Capacity: {formData.modes.online.maxCapacity} | Price: ₹{formData.modes.online.price}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    Use 24-hour format (e.g., 09:30 for 9:30 AM, 14:30 for 2:30 PM)
                  </p>
                  
                  {formData.scheduleConfig.online.timeSlots.map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-sm font-medium text-gray-700 min-w-[50px]">From:</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange('online', index, 'startTime', e.target.value)}
                          className="flex-1 sm:flex-none sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="24-hour format (HH:MM)"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-sm font-medium text-gray-700 min-w-[50px]">To:</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange('online', index, 'endTime', e.target.value)}
                          className="flex-1 sm:flex-none sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          title="24-hour format (HH:MM)"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeTimeSlot('online', index)}
                        className="self-end sm:self-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                        aria-label="Remove time slot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addTimeSlot('online')}
                    className="w-full py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
                  >
                    + Add Online Time Slot
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Offline Schedule Configuration */}
            {currentStep === 6 && formData.modes.offline.enabled && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Offline Schedule Configuration</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure when your offline classes will run</p>
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Days for Offline Classes *
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {days.map((day) => (
                      <label key={day} className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.scheduleConfig.offline.selectedDays.includes(day)}
                          onChange={() => handleScheduleDayToggle('offline', day)}
                          className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium truncate">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleConfig.offline.dateRange.startDate}
                      onChange={(e) => handleScheduleDateChange('offline', 'startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleConfig.offline.dateRange.endDate}
                      onChange={(e) => handleScheduleDateChange('offline', 'endDate', e.target.value)}
                      min={formData.scheduleConfig.offline.dateRange.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                    <h3 className="text-lg font-medium text-gray-900">Offline Time Slots *</h3>
                    <span className="text-xs sm:text-sm text-gray-500">
                      Capacity: {formData.modes.offline.maxCapacity} | Price: ₹{formData.modes.offline.price}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    Use 24-hour format (e.g., 09:30 for 9:30 AM, 14:30 for 2:30 PM)
                  </p>
                  
                  {formData.scheduleConfig.offline.timeSlots.map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-sm font-medium text-gray-700 min-w-[50px]">From:</label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange('offline', index, 'startTime', e.target.value)}
                          className="flex-1 sm:flex-none sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          title="24-hour format (HH:MM)"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1">
                        <label className="text-sm font-medium text-gray-700 min-w-[50px]">To:</label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange('offline', index, 'endTime', e.target.value)}
                          className="flex-1 sm:flex-none sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          title="24-hour format (HH:MM)"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeTimeSlot('offline', index)}
                        className="self-end sm:self-auto p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md transition-colors"
                        aria-label="Remove time slot"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => addTimeSlot('offline')}
                    className="w-full py-2 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:text-green-700 transition-colors"
                  >
                    + Add Offline Time Slot
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Photos & Review */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos & Review</h2>
                
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Photos *<span className="text-red-500 ml-1">(Required, max 5)</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">Add at least one photo to showcase your class environment and activities</p>
                  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload photos</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                  </div>
                  
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-600 text-white rounded-full p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove photo"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Class</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Title:</span>
                        <p className="text-sm text-gray-900">{formData.title || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Specialty:</span>
                        <p className="text-sm text-gray-900">
                          {specialties.find(s => s._id === formData.specialty)?.name || 'Not selected'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                        <p className="text-sm text-gray-900">{formData.difficulty}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Timezone:</span>
                        <p className="text-sm text-gray-900">{formData.timezone}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Modes:</span>
                      <div className="flex gap-2 mt-1">
                        {formData.modes.online.enabled && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Online: ₹{formData.modes.online.price}/session (max {formData.modes.online.maxCapacity})
                          </span>
                        )}
                        {formData.modes.offline.enabled && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Offline: ₹{formData.modes.offline.price}/session (max {formData.modes.offline.maxCapacity}) - {formData.offlineLocation || 'Location not set'}
                          </span>
                        )}
                      </div>
                    </div>

                    {formData.modes.online.enabled && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Online Schedule:</span>
                        <div className="text-sm text-gray-900 mt-1 space-y-1">
                          <p><strong>Days:</strong> {formData.scheduleConfig.online.selectedDays.join(', ') || 'None selected'}</p>
                          <p><strong>Period:</strong> {formData.scheduleConfig.online.dateRange.startDate} to {formData.scheduleConfig.online.dateRange.endDate}</p>
                          <div>
                            <strong>Time Slots ({formData.scheduleConfig.online.timeSlots.length}):</strong>
                            {formData.scheduleConfig.online.timeSlots.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {formData.scheduleConfig.online.timeSlots.map((slot, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-red-600"> None configured</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.modes.offline.enabled && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Offline Schedule:</span>
                        <div className="text-sm text-gray-900 mt-1 space-y-1">
                          <p><strong>Days:</strong> {formData.scheduleConfig.offline.selectedDays.join(', ') || 'None selected'}</p>
                          <p><strong>Period:</strong> {formData.scheduleConfig.offline.dateRange.startDate} to {formData.scheduleConfig.offline.dateRange.endDate}</p>
                          <div>
                            <strong>Time Slots ({formData.scheduleConfig.offline.timeSlots.length}):</strong>
                            {formData.scheduleConfig.offline.timeSlots.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {formData.scheduleConfig.offline.timeSlots.map((slot, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-red-600"> None configured</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-sm font-medium text-gray-500">Tags:</span>
                      <p className="text-sm text-gray-900">
                        {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Photos:</span>
                      <p className={`text-sm ${photos.length > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {photos.length} photo(s) selected {photos.length === 0 ? '(Required: Upload at least 1)' : ''}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Certifications:</span>
                      <p className="text-sm text-gray-900">
                        {formData.guideCertifications.filter(cert => cert.trim()).length} certification(s)
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Skills to Learn:</span>
                      <p className="text-sm text-gray-900">
                        {formData.skillsToLearn.filter(skill => skill.trim()).length} skill(s)
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">About Sections:</span>
                      <p className="text-sm text-gray-900">
                        {formData.aboutSections.filter(section => section.header && section.paragraph).length} section(s) configured
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">What happens next?</h4>
                      <div className="text-sm text-yellow-700 mt-1">
                        <p>• Your class will be submitted for admin review</p>
                        <p>• Time slots and photos will be processed in the background</p>
                        <p>• Once approved, it will be visible on your profile</p>
                        <p>• Students can then start booking your classes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                <span className="hidden xs:inline">Previous</span>
                <span className="xs:hidden">Prev</span>
              </button>

              <div className="flex items-center space-x-3">
                {/* Step indicator */}
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  {currentStep} of {totalSteps}
                </span>
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <span className="hidden xs:inline">Next</span>
                    <span className="xs:hidden">Next</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex items-center px-4 sm:px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                      loading
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="hidden sm:inline">Creating Class...</span>
                        <span className="sm:hidden">Creating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="hidden sm:inline">Create Class</span>
                        <span className="sm:hidden">Create</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default CreateWellnessGuideClass;