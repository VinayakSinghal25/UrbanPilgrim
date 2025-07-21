// src/components/Admin/PilgrimExperience/EditPilgrimExperience.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { pilgrimExperienceApi } from '../../../../../services/pilgrimExperienceApi';

const EditPilgrimExperience = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    priceSingle: '',
    priceCouple: '',
    whatToExpect: '',
    images: [],
    existingImages: [],
    about: [{ heading: '', paragraphs: [''] }],
    retreatGuideBio: '',
    retreatGuideLink: '',
    retreatGuideImage: '',
    address: '',
    mapLink: '',
    programSchedule: [
      {
        dayTitle: '',
        activities: [
          {
            time: '',
            displayTitle: '',
            detailedTitle: '',
            subheading: '',
            description: ''
          }
        ]
      }
    ],
    termsAndConditions: [''],
    trainerProfileLink: '',
    occupancyOptions: ['Single'],
    availableDates: [{
      from: '',
      to: ''
    }],
    whatsIncluded: [''],
    whatsNotIncluded: ['']
  });

  useEffect(() => {
    fetchExperience();
  }, [id]);

  const fetchExperience = async () => {
    try {
      setInitialLoading(true);
      const data = await pilgrimExperienceApi.getById(id);
      const experience = data.pilgrimExperience;
      
      // Store original data for comparison
      setOriginalData(experience);
      
      // Format dates for input fields
      const formattedAvailableDates = experience.availableDates?.map(date => ({
        from: date.from ? new Date(date.from).toISOString().split('T')[0] : '',
        to: date.to ? new Date(date.to).toISOString().split('T')[0] : ''
      })) || [{ from: '', to: '' }];
      
      // Ensure arrays have at least one empty item if they're empty
      const ensureNonEmptyArray = (arr, defaultItem) => {
        if (!arr || arr.length === 0) return [defaultItem];
        return arr;
      };

      setFormData({
        name: experience.name || '',
        location: experience.location || '',
        priceSingle: experience.priceSingle || '',
        priceCouple: experience.priceCouple || '',
        whatToExpect: experience.whatToExpect || '',
        images: [],
        existingImages: experience.images || [],
        about: ensureNonEmptyArray(experience.about, { heading: '', paragraphs: [''] }),
        retreatGuideBio: experience.retreatGuideBio || '',
        retreatGuideLink: experience.retreatGuideLink || '',
        retreatGuideImage: experience.retreatGuideImage || '',
        address: experience.address || '',
        mapLink: experience.mapLink || '',
        programSchedule: ensureNonEmptyArray(experience.programSchedule, {
          dayTitle: '',
          activities: [{
            time: '',
            displayTitle: '',
            detailedTitle: '',
            subheading: '',
            description: ''
          }]
        }),
        termsAndConditions: ensureNonEmptyArray(experience.termsAndConditions, ''),
        trainerProfileLink: experience.trainerProfileLink || '',
        occupancyOptions: experience.occupancyOptions || ['Single'],
        availableDates: formattedAvailableDates,
        whatsIncluded: ensureNonEmptyArray(experience.whatsIncluded, ''),
        whatsNotIncluded: ensureNonEmptyArray(experience.whatsNotIncluded, '')
      });
    } catch (error) {
      console.error('Error fetching experience:', error);
      alert('Error fetching experience: ' + (error.message || 'Unknown error'));
      navigate('/admin/dashboard/pilgrim-experiences');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleOccupancyChange = (option) => {
    setFormData(prev => ({
      ...prev,
      occupancyOptions: prev.occupancyOptions.includes(option)
        ? prev.occupancyOptions.filter(opt => opt !== option)
        : [...prev.occupancyOptions, option]
    }));
  };

  const handleDateChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      availableDates: prev.availableDates.map((date, i) => 
        i === index ? { ...date, [field]: value } : date
      )
    }));
  };

  const addDateRange = () => {
    setFormData(prev => ({
      ...prev,
      availableDates: [...prev.availableDates, { from: '', to: '' }]
    }));
  };

  const removeDateRange = (index) => {
    setFormData(prev => ({
      ...prev,
      availableDates: prev.availableDates.filter((_, i) => i !== index)
    }));
  };

  // About section handlers
  const addAboutSection = () => {
    setFormData(prev => ({
      ...prev,
      about: [...prev.about, { heading: '', paragraphs: [''] }]
    }));
  };

  const removeAboutSection = (index) => {
    setFormData(prev => ({
      ...prev,
      about: prev.about.filter((_, i) => i !== index)
    }));
  };

  const updateAboutSection = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      about: prev.about.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addParagraphToAbout = (sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      about: prev.about.map((section, i) => 
        i === sectionIndex 
          ? { ...section, paragraphs: [...section.paragraphs, ''] }
          : section
      )
    }));
  };

  const removeParagraphFromAbout = (sectionIndex, paragraphIndex) => {
    setFormData(prev => ({
      ...prev,
      about: prev.about.map((section, i) => 
        i === sectionIndex 
          ? { 
              ...section, 
              paragraphs: section.paragraphs.filter((_, pi) => pi !== paragraphIndex)
            }
          : section
      )
    }));
  };

  const updateAboutParagraph = (sectionIndex, paragraphIndex, value) => {
    setFormData(prev => ({
      ...prev,
      about: prev.about.map((section, i) => 
        i === sectionIndex 
          ? {
              ...section,
              paragraphs: section.paragraphs.map((p, pi) => 
                pi === paragraphIndex ? value : p
              )
            }
          : section
      )
    }));
  };

  // Program schedule handlers
  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      programSchedule: [
        ...prev.programSchedule,
        {
          dayTitle: '',
          activities: [{
            time: '',
            displayTitle: '',
            detailedTitle: '',
            subheading: '',
            description: ''
          }]
        }
      ]
    }));
  };

  const removeDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.filter((_, i) => i !== dayIndex)
    }));
  };

  const updateDay = (dayIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.map((day, i) => 
        i === dayIndex ? { ...day, [field]: value } : day
      )
    }));
  };

  const addActivity = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.map((day, i) => 
        i === dayIndex 
          ? {
              ...day,
              activities: [
                ...day.activities,
                {
                  time: '',
                  displayTitle: '',
                  detailedTitle: '',
                  subheading: '',
                  description: ''
                }
              ]
            }
          : day
      )
    }));
  };

  const removeActivity = (dayIndex, activityIndex) => {
    setFormData(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.map((day, i) => 
        i === dayIndex 
          ? {
              ...day,
              activities: day.activities.filter((_, ai) => ai !== activityIndex)
            }
          : day
      )
    }));
  };

  const updateActivity = (dayIndex, activityIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      programSchedule: prev.programSchedule.map((day, i) => 
        i === dayIndex 
          ? {
              ...day,
              activities: day.activities.map((activity, ai) => 
                ai === activityIndex ? { ...activity, [field]: value } : activity
              )
            }
          : day
      )
    }));
  };

  // Terms and conditions handlers
  const addTerm = () => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: [...prev.termsAndConditions, '']
    }));
  };

  const removeTerm = (index) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index)
    }));
  };

  const updateTerm = (index, value) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.map((term, i) => 
        i === index ? value : term
      )
    }));
  };

  // What's included handlers
  const addIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: [...prev.whatsIncluded, '']
    }));
  };

  const removeIncludedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.filter((_, i) => i !== index)
    }));
  };

  const updateIncludedItem = (index, value) => {
    setFormData(prev => ({
      ...prev,
      whatsIncluded: prev.whatsIncluded.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  // What's not included handlers
  const addNotIncludedItem = () => {
    setFormData(prev => ({
      ...prev,
      whatsNotIncluded: [...prev.whatsNotIncluded, '']
    }));
  };

  const removeNotIncludedItem = (index) => {
    setFormData(prev => ({
      ...prev,
      whatsNotIncluded: prev.whatsNotIncluded.filter((_, i) => i !== index)
    }));
  };

  const updateNotIncludedItem = (index, value) => {
    setFormData(prev => ({
      ...prev,
      whatsNotIncluded: prev.whatsNotIncluded.map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  // Function to compare and get only changed fields
  const getChangedFields = () => {
    const changes = {};
    
    // Compare basic fields including the new pricing fields
    const basicFields = [
      'name', 'location', 'priceSingle', 'priceCouple', 'whatToExpect', 
      'retreatGuideBio', 'retreatGuideLink', 'retreatGuideImage', 
      'trainerProfileLink', 'address', 'mapLink'
    ];
    
    basicFields.forEach(field => {
      if (formData[field] !== (originalData[field] || '')) {
        changes[field] = formData[field];
      }
    });

    // Compare arrays and objects
    const arrayFields = ['about', 'programSchedule', 'termsAndConditions', 'occupancyOptions', 'availableDates', 'whatsIncluded', 'whatsNotIncluded'];
    
    arrayFields.forEach(field => {
      const original = JSON.stringify(originalData[field] || []);
      const current = JSON.stringify(formData[field]);
      
      if (original !== current) {
        changes[field] = formData[field];
      }
    });

    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Get only changed fields
      const changedFields = getChangedFields();
      
      // If no fields changed and no new images, don't submit
      if (Object.keys(changedFields).length === 0 && formData.images.length === 0) {
        alert('No changes detected. Please make some changes before saving.');
        setLoading(false);
        return;
      }

      // Append only changed basic fields
      const basicFields = [
        'name', 'location', 'priceSingle', 'priceCouple', 'whatToExpect', 
        'retreatGuideBio', 'retreatGuideLink', 'retreatGuideImage', 
        'trainerProfileLink', 'address', 'mapLink'
      ];
      
      basicFields.forEach(field => {
        if (changedFields[field] !== undefined) {
          submitData.append(field, changedFields[field]);
        }
      });
      
      // Append changed JSON fields
      const jsonFields = ['about', 'programSchedule', 'termsAndConditions', 'occupancyOptions', 'availableDates', 'whatsIncluded', 'whatsNotIncluded'];
      
      jsonFields.forEach(field => {
        if (changedFields[field] !== undefined) {
          submitData.append(field, JSON.stringify(changedFields[field]));
        }
      });
      
      // Append new images only if any are selected
      if (formData.images.length > 0) {
        formData.images.forEach((image) => {
          submitData.append('images', image);
        });
      }

      await pilgrimExperienceApi.update(id, submitData);
      
      // Show success message and navigate back
      alert('Experience updated successfully!');
      navigate('/admin/dashboard/pilgrim-experiences');
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Error updating experience: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/admin/dashboard/pilgrim-experiences')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Pilgrim Experience</h1>
          <p className="text-gray-600 mt-1">Update the details of your experience (only changed fields will be saved)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Holistic Wellness with Anisha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Raga on the Ganges"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price for Single Occupancy (₹) *
              </label>
              <input
                type="number"
                name="priceSingle"
                value={formData.priceSingle}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="45000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price for Couple Occupancy (₹) *
              </label>
              <input
                type="number"
                name="priceCouple"
                value={formData.priceCouple}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="80000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trainer Profile Link
              </label>
              <input
                type="url"
                name="trainerProfileLink"
                value={formData.trainerProfileLink}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="Enter the full address details..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps Link
            </label>
            <input
              type="url"
              name="mapLink"
              value={formData.mapLink}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="https://maps.google.com/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the Google Maps share link for this location
            </p>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What to Expect
            </label>
            <textarea
              name="whatToExpect"
              value={formData.whatToExpect}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              placeholder="Describe what participants can expect from this experience..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occupancy Options
            </label>
            <div className="flex space-x-4">
              {['Single', 'Couple'].map(option => (
                <label key={option} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.occupancyOptions.includes(option)}
                    onChange={() => handleOccupancyChange(option)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Existing Images Display */}
          {formData.existingImages.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Images
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.existingImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Experience ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Images (Optional - will replace existing images)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            />
            {formData.images.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {formData.images.length} new file(s) selected (will replace existing images)
              </p>
            )}
          </div>
        </div>

        {/* Retreat Guide Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Retreat Guide Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guide Bio *
              </label>
              <textarea
                name="retreatGuideBio"
                value={formData.retreatGuideBio}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="Tell us about the retreat guide..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guide Link *
              </label>
              <input
                type="url"
                name="retreatGuideLink"
                value={formData.retreatGuideLink}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guide Image
              </label>
              <input
                type="text"
                name="retreatGuideImage"
                value={formData.retreatGuideImage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="Image URL or path"
              />
            </div>
          </div>
        </div>

        {/* Available Dates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Dates</h2>
            <button
              type="button"
              onClick={addDateRange}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Date Range
            </button>
          </div>

          {formData.availableDates.map((date, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={date.from}
                  onChange={(e) => handleDateChange(index, 'from', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={date.to}
                  onChange={(e) => handleDateChange(index, 'to', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              {formData.availableDates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDateRange(index)}
                  className="mt-6 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* About Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">About Sections</h2>
            <button
              type="button"
              onClick={addAboutSection}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Section
            </button>
          </div>

          {formData.about.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Section {sectionIndex + 1}</h3>
                {formData.about.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAboutSection(sectionIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => updateAboutSection(sectionIndex, 'heading', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., The Journey Inward Begins"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paragraphs
                </label>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <div key={paragraphIndex} className="flex items-start space-x-2 mb-2">
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateAboutParagraph(sectionIndex, paragraphIndex, e.target.value)}
                      rows="3"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                      placeholder="Enter paragraph content..."
                    />
                    {section.paragraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParagraphFromAbout(sectionIndex, paragraphIndex)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addParagraphToAbout(sectionIndex)}
                  className="text-sm text-amber-600 hover:text-amber-800"
                >
                  + Add Paragraph
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Program Schedule */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Program Schedule</h2>
            <button
              type="button"
              onClick={addDay}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Day
            </button>
          </div>

          {formData.programSchedule.map((day, dayIndex) => (
            <div key={dayIndex} className="mb-8 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Day {dayIndex + 1}</h3>
                {formData.programSchedule.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Day Title
                </label>
                <input
                  type="text"
                  value={day.dayTitle}
                  onChange={(e) => updateDay(dayIndex, 'dayTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  placeholder="e.g., Day 1: Arrival & Immersion"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Activities
                  </label>
                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="text-sm text-amber-600 hover:text-amber-800"
                  >
                    + Add Activity
                  </button>
                </div>

                {day.activities.map((activity, activityIndex) => (
                  <div key={activityIndex} className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Activity {activityIndex + 1}</h4>
                      {day.activities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeActivity(dayIndex, activityIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Time
                        </label>
                        <input
                          type="text"
                          value={activity.time}
                          onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                          placeholder="e.g., 12:00 PM"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Display Title *
                        </label>
                        <input
                          type="text"
                          value={activity.displayTitle}
                          onChange={(e) => updateActivity(dayIndex, activityIndex, 'displayTitle', e.target.value)}
                          required
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                          placeholder="e.g., Arrival and Immersion"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Detailed Title *
                      </label>
                      <input
                        type="text"
                        value={activity.detailedTitle}
                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'detailedTitle', e.target.value)}
                        required
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., Arrival and Immersion | Soul Reboot Retreat at Raga on the Ganges"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Subheading (Optional)
                      </label>
                      <input
                        type="text"
                        value={activity.subheading}
                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'subheading', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                        placeholder="e.g., Step into serenity."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={activity.description}
                        onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                        required
                        rows="3"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Detailed description of the activity..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">What's Included</h2>
            <button
              type="button"
              onClick={addIncludedItem}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          {formData.whatsIncluded.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={item}
                onChange={(e) => updateIncludedItem(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., All meals included"
              />
              {formData.whatsIncluded.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIncludedItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* What's Not Included */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">What's Not Included</h2>
            <button
              type="button"
              onClick={addNotIncludedItem}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          {formData.whatsNotIncluded.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={item}
                onChange={(e) => updateNotIncludedItem(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="e.g., Travel insurance"
              />
              {formData.whatsNotIncluded.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeNotIncludedItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Terms and Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Terms and Conditions</h2>
            <button
              type="button"
              onClick={addTerm}
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Term
            </button>
          </div>

          {formData.termsAndConditions.map((term, index) => (
            <div key={index} className="flex items-start space-x-2 mb-4">
              <textarea
                value={term}
                onChange={(e) => updateTerm(index, e.target.value)}
                rows="2"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter a term or condition..."
              />
              {formData.termsAndConditions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTerm(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/pilgrim-experiences')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPilgrimExperience;