import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getAllSpecialties } from '../api/wellnessGuideApi';
import { getMyAddresses, createWellnessGuideClass } from '../api/WellnessGuideClassApi';

const CreateWellnessGuideClass = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about: '',
    specialty: '',
    difficulty: 'Beginner',
    timezone: 'Asia/Kolkata',
    tags: [],
    guideCertifications: [''],
    skillsToLearn: [''],
    aboutSections: [{ header: '', paragraph: '' }],
    modes: {
      online: { enabled: false, maxCapacity: '', price: '' },
      offline: { enabled: false, maxCapacity: '', price: '' }
    },
    scheduleConfig: {
      selectedDays: [],
      timeSlots: { online: [], offline: [] },
      dateRange: { startDate: '', endDate: '' }
    },
    selectedAddressId: '',
    newAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      landmark: '',
      addressType: 'studio'
    },
    isNewAddress: false
  });

  const [photos, setPhotos] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalSteps = 6;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const addressTypes = ['home', 'office', 'studio', 'gym', 'other'];

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

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        selectedDays: prev.scheduleConfig.selectedDays.includes(day)
          ? prev.scheduleConfig.selectedDays.filter(d => d !== day)
          : [...prev.scheduleConfig.selectedDays, day]
      }
    }));
  };

  const handleTimeSlotChange = (mode, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        timeSlots: {
          ...prev.scheduleConfig.timeSlots,
          [mode]: prev.scheduleConfig.timeSlots[mode].map((slot, i) => 
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
        timeSlots: {
          ...prev.scheduleConfig.timeSlots,
          [mode]: [...prev.scheduleConfig.timeSlots[mode], { startTime: '', endTime: '' }]
        }
      }
    }));
  };

  const removeTimeSlot = (mode, index) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        timeSlots: {
          ...prev.scheduleConfig.timeSlots,
          [mode]: prev.scheduleConfig.timeSlots[mode].filter((_, i) => i !== index)
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
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.about && formData.specialty;
      case 2:
        return formData.guideCertifications.some(cert => cert.trim()) && 
               formData.skillsToLearn.some(skill => skill.trim());
      case 3:
        return formData.aboutSections.every(section => section.header && section.paragraph);
      case 4:
        const modesValid = (formData.modes.online.enabled || formData.modes.offline.enabled);
        const onlineValid = !formData.modes.online.enabled || 
          (formData.modes.online.maxCapacity && formData.modes.online.price);
        const offlineValid = !formData.modes.offline.enabled || 
          (formData.modes.offline.maxCapacity && formData.modes.offline.price && 
           (formData.selectedAddressId || (formData.isNewAddress && formData.newAddress.street)));
        return modesValid && onlineValid && offlineValid;
      case 5:
        const hasSelectedDays = formData.scheduleConfig.selectedDays.length > 0;
        const hasDateRange = formData.scheduleConfig.dateRange.startDate && 
                             formData.scheduleConfig.dateRange.endDate;
        const hasOnlineSlots = !formData.modes.online.enabled || 
          formData.scheduleConfig.timeSlots.online.length > 0;
        const hasOfflineSlots = !formData.modes.offline.enabled || 
          formData.scheduleConfig.timeSlots.offline.length > 0;
        return hasSelectedDays && hasDateRange && hasOnlineSlots && hasOfflineSlots;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    } else {
      setError('Please fill all required fields in this step');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      
      // Basic fields
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('about', formData.about);
      submitData.append('specialty', formData.specialty);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('timezone', formData.timezone);
      
      // JSON fields
      submitData.append('guideCertifications', JSON.stringify(formData.guideCertifications.filter(cert => cert.trim())));
      submitData.append('skillsToLearn', JSON.stringify(formData.skillsToLearn.filter(skill => skill.trim())));
      submitData.append('aboutSections', JSON.stringify(formData.aboutSections));
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('modes', JSON.stringify(formData.modes));
      submitData.append('scheduleConfig', JSON.stringify(formData.scheduleConfig));
      
      // Address handling
      submitData.append('isNewAddress', formData.isNewAddress);
      if (formData.isNewAddress) {
        submitData.append('newAddress', JSON.stringify(formData.newAddress));
      } else if (formData.selectedAddressId) {
        submitData.append('selectedAddressId', formData.selectedAddressId);
      }
      
      // Photos
      photos.forEach((photo, index) => {
        submitData.append('photos', photo);
      });

      await createWellnessGuideClass(submitData);
      setShowSuccess(true);
      
    } catch (err) {
      setError(err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

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
            Your wellness class has been submitted for admin review. You'll receive an email notification once it's approved.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/wellness-guide-dashboard')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setShowSuccess(false);
                setCurrentStep(1);
                setFormData({
                  title: '', description: '', about: '', specialty: '', difficulty: 'Beginner',
                  timezone: 'Asia/Kolkata', tags: [], guideCertifications: [''], 
                  skillsToLearn: [''], aboutSections: [{ header: '', paragraph: '' }],
                  modes: { online: { enabled: false, maxCapacity: '', price: '' }, 
                          offline: { enabled: false, maxCapacity: '', price: '' } },
                  scheduleConfig: { selectedDays: [], timeSlots: { online: [], offline: [] }, 
                                   dateRange: { startDate: '', endDate: '' } },
                  selectedAddressId: '', newAddress: { street: '', city: '', state: '', 
                  zipCode: '', country: 'India', landmark: '', addressType: 'studio' }, 
                  isNewAddress: false
                });
                setPhotos([]);
              }}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
            >
              Create Another Class
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Create Wellness Class</h1>
            <button
              onClick={() => navigate('/wellness-guide-dashboard')}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 6 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}: {
              ['Basic Information', 'Certifications & Skills', 'About Sections', 
               'Modes & Pricing', 'Schedule Configuration', 'Photos & Review'][currentStep - 1]
            }
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Stress Relief Yoga for Beginners"
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
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of your class..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About This Class *
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detailed information about what participants will learn..."
                  />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {difficulties.map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., yoga, stress relief, breathing"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Certifications & Skills */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Certifications & Skills</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Certifications *
                  </label>
                  {formData.guideCertifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={cert}
                        onChange={(e) => handleArrayChange('guideCertifications', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Certified Yoga Instructor (RYT 200)"
                      />
                      {formData.guideCertifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('guideCertifications', index)}
                          className="p-2 text-red-600 hover:text-red-800"
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
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another Certification
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills Students Will Learn *
                  </label>
                  {formData.skillsToLearn.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange('skillsToLearn', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Deep breathing techniques"
                      />
                      {formData.skillsToLearn.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('skillsToLearn', index)}
                          className="p-2 text-red-600 hover:text-red-800"
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
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Another Skill
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: About Sections */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About Sections</h2>
                
                {formData.aboutSections.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">Section {index + 1}</h3>
                      {formData.aboutSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('aboutSections', index)}
                          className="text-red-600 hover:text-red-800"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Detailed content for this section..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('aboutSections', { header: '', paragraph: '' })}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Another Section
                </button>
              </div>
            )}

            {/* Step 4: Modes & Pricing */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Modes & Pricing</h2>
                
                {/* Online Mode */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={formData.modes.online.enabled}
                      onChange={(e) => handleModeChange('online', 'enabled', e.target.checked)}
                      className="mr-3"
                    />
                    <h3 className="text-lg font-medium text-gray-900">Online Classes</h3>
                  </div>
                  
                  {formData.modes.online.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Offline Mode */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      checked={formData.modes.offline.enabled}
                      onChange={(e) => handleModeChange('offline', 'enabled', e.target.checked)}
                      className="mr-3"
                    />
                    <h3 className="text-lg font-medium text-gray-900">Offline Classes</h3>
                  </div>
                  
                  {formData.modes.offline.enabled && (
                    <div className="space-y-4">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* Address Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Location *
                        </label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="addressOption"
                              checked={!formData.isNewAddress}
                              onChange={() => setFormData(prev => ({ ...prev, isNewAddress: false }))}
                              className="mr-2"
                            />
                            <span>Use existing address</span>
                          </div>
                          
                          {!formData.isNewAddress && (
                            <select
                              value={formData.selectedAddressId}
                              onChange={(e) => handleInputChange({ target: { name: 'selectedAddressId', value: e.target.value } })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select an address</option>
                              {addresses.map((address) => (
                                <option key={address._id} value={address._id}>
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
                              className="mr-2"
                            />
                            <span>Add new address</span>
                          </div>
                          
                          {formData.isNewAddress && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.street}
                                  onChange={(e) => handleAddressChange('street', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.city}
                                  onChange={(e) => handleAddressChange('city', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.state}
                                  onChange={(e) => handleAddressChange('state', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.zipCode}
                                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                                <input
                                  type="text"
                                  value={formData.newAddress.landmark}
                                  onChange={(e) => handleAddressChange('landmark', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                                <select
                                  value={formData.newAddress.addressType}
                                  onChange={(e) => handleAddressChange('addressType', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Step 5: Schedule Configuration */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule Configuration</h2>
                
                {/* Days Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Days *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {days.map((day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.scheduleConfig.selectedDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="mr-2"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleConfig.dateRange.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scheduleConfig: {
                          ...prev.scheduleConfig,
                          dateRange: { ...prev.scheduleConfig.dateRange, startDate: e.target.value }
                        }
                      }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduleConfig.dateRange.endDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scheduleConfig: {
                          ...prev.scheduleConfig,
                          dateRange: { ...prev.scheduleConfig.dateRange, endDate: e.target.value }
                        }
                      }))}
                      min={formData.scheduleConfig.dateRange.startDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                {formData.modes.online.enabled && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Online Time Slots *</h3>
                    {formData.scheduleConfig.timeSlots.online.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange('online', index, 'startTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange('online', index, 'endTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot('online', index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTimeSlot('online')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Time Slot
                    </button>
                  </div>
                )}

                {formData.modes.offline.enabled && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Offline Time Slots *</h3>
                    {formData.scheduleConfig.timeSlots.offline.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleTimeSlotChange('offline', index, 'startTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleTimeSlotChange('offline', index, 'endTime', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeTimeSlot('offline', index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addTimeSlot('offline')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Time Slot
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Photos & Review */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Photos & Review</h2>
                
                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Photos (Optional, max 5)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                          >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span className="text-sm font-medium text-gray-500">Selected Days:</span>
                        <p className="text-sm text-gray-900">
                          {formData.scheduleConfig.selectedDays.join(', ') || 'None selected'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Modes:</span>
                      <div className="flex gap-2 mt-1">
                        {formData.modes.online.enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Online (₹{formData.modes.online.price}/session, max {formData.modes.online.maxCapacity})
                          </span>
                        )}
                        {formData.modes.offline.enabled && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Offline (₹{formData.modes.offline.price}/session, max {formData.modes.offline.maxCapacity})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Schedule Period:</span>
                      <p className="text-sm text-gray-900">
                        {formData.scheduleConfig.dateRange.startDate} to {formData.scheduleConfig.dateRange.endDate}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Tags:</span>
                      <p className="text-sm text-gray-900">
                        {formData.tags.length > 0 ? formData.tags.join(', ') : 'None'}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-gray-500">Photos:</span>
                      <p className="text-sm text-gray-900">{photos.length} photo(s) selected</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 text-sm font-medium rounded-md ${
                    loading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Class...
                    </span>
                  ) : (
                    'Create Class'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWellnessGuideClass;