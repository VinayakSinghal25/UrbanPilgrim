import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllSpecialties, createWellnessGuide } from '../../../../api/wellnessGuideApi';

const WellnessGuideForm = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    gender: '',
    customGender: '',
    profileDescription: '',
    areaOfExpertise: '',
    languages: [],
    addresses: [],
    selectedAddressIndex: null // Track which address is selected
  });
  
  const [profilePictures, setProfilePictures] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    label: 'Home'
  });

  // Available languages and genders
  const availableLanguages = ['English', 'Hindi', 'Spanish', 'French', 'Other'];
  const genderOptions = ['Male', 'Female', 'Others'];

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userAddresses = user.address || [];
      console.log('User addresses from Redux:', userAddresses); // Debug log
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        contactNumber: user.contactNumber || '',
        addresses: userAddresses,
        // If user has addresses, automatically select the first one
        selectedAddressIndex: userAddresses.length > 0 ? 0 : null
      }));
    }
  }, [user]);

  // Fetch specialties
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const specialtiesData = await getAllSpecialties();
        setSpecialties(specialtiesData);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        setError('Failed to load specialties. Please refresh the page.');
      }
    };
    
    fetchSpecialties();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear custom gender if gender is not 'Others'
    if (name === 'gender' && value !== 'Others') {
      setFormData(prev => ({
        ...prev,
        customGender: ''
      }));
    }
  };

  const handleLanguageChange = (language) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(lang => lang !== language)
        : [...prev.languages, language]
    }));
  };

  const handleAddressSelect = (addressIndex) => {
    setFormData(prev => ({
      ...prev,
      selectedAddressIndex: addressIndex
    }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addNewAddress = () => {
    if (newAddress.street && newAddress.locality && newAddress.city && newAddress.state && newAddress.pincode) {
      const updatedAddresses = [...formData.addresses, { ...newAddress, country: 'India' }];
      setFormData(prev => ({
        ...prev,
        addresses: updatedAddresses,
        selectedAddressIndex: updatedAddresses.length - 1 // Select the newly added address
      }));
      setNewAddress({
        street: '',
        locality: '',
        city: '',
        state: '',
        pincode: '',
        label: 'Home'
      });
      setShowAddAddress(false);
    } else {
      setError('Please fill all required address fields');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      setError('Maximum 5 profile pictures allowed');
      return;
    }
    setProfilePictures(files);
    setError(''); // Clear any previous file error
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.firstName.trim()) {
        throw new Error('First name is required');
      }
      if (!formData.lastName.trim()) {
        throw new Error('Last name is required');
      }
      if (!formData.contactNumber.trim()) {
        throw new Error('Contact number is required');
      }
      if (!formData.gender) {
        throw new Error('Gender is required');
      }
      if (formData.gender === 'Others' && !formData.customGender.trim()) {
        throw new Error('Custom gender is required when "Others" is selected');
      }
      if (formData.languages.length === 0) {
        throw new Error('At least one language must be selected');
      }
      if (!formData.areaOfExpertise) {
        throw new Error('Area of expertise is required');
      }
      if (!formData.profileDescription.trim()) {
        throw new Error('Profile description is required');
      }
      if (formData.profileDescription.trim().length < 50) {
        throw new Error('Profile description must be at least 50 characters');
      }
      // Check if user has addresses and selected one
      if (formData.addresses.length === 0) {
        throw new Error('At least one address is required');
      }
      if (formData.selectedAddressIndex === null) {
        throw new Error('Please select an address');
      }
      if (profilePictures.length === 0) {
        throw new Error('At least one profile picture is required');
      }

      // Debug logs
      console.log('Form data before submission:', formData);
      console.log('Selected address index:', formData.selectedAddressIndex);
      console.log('Addresses array:', formData.addresses);

      // Prepare form data with proper address formatting
      const submitFormData = new FormData();
      
      // Add form fields
      submitFormData.append('firstName', formData.firstName);
      submitFormData.append('lastName', formData.lastName);
      submitFormData.append('contactNumber', formData.contactNumber);
      submitFormData.append('gender', formData.gender);
      if (formData.gender === 'Others') {
        submitFormData.append('customGender', formData.customGender);
      }
      submitFormData.append('profileDescription', formData.profileDescription);
      submitFormData.append('areaOfExpertise', JSON.stringify([formData.areaOfExpertise])); // Send as array
      submitFormData.append('languages', JSON.stringify(formData.languages));
      
      // Ensure addresses are properly formatted for backend
      const addressesToSend = formData.addresses.map(addr => ({
        street: addr.street,
        locality: addr.locality,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'India',
        label: addr.label || 'Home'
      }));
      
      console.log('Addresses being sent to backend:', addressesToSend);
      submitFormData.append('addresses', JSON.stringify(addressesToSend));

      // Add profile pictures
      profilePictures.forEach((file) => {
        submitFormData.append('profilePictures', file);
      });

      // Debug: Log what we're sending
      console.log('FormData entries:');
      for (let pair of submitFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Submit form
      await createWellnessGuide(token, submitFormData);
      
      // Navigate to dashboard
      navigate('/wellness-guide-dashboard');
      
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Become a Wellness Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your profile to join our community of wellness professionals and start sharing your expertise.
          </p>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800">
              Debug: Addresses count: {formData.addresses.length}, 
              Selected: {formData.selectedAddressIndex !== null ? formData.selectedAddressIndex : 'None'}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              
              {/* Email (Read-only) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Your verified email address cannot be changed</p>
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Number */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gender */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {genderOptions.map((gender) => (
                    <label key={gender} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      {gender}
                    </label>
                  ))}
                </div>
                {formData.gender === 'Others' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      name="customGender"
                      value={formData.customGender}
                      onChange={handleInputChange}
                      placeholder="Please specify your gender"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Address Information</h2>
              <p className="text-sm text-gray-600 mb-4">
                Select an existing address or add a new one. This will be used for offline classes and general contact.
              </p>

              {/* Existing Addresses */}
              {formData.addresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Your Saved Addresses:</h3>
                  <div className="space-y-3">
                    {formData.addresses.map((address, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-md cursor-pointer transition-colors ${
                          formData.selectedAddressIndex === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => handleAddressSelect(index)}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="selectedAddress"
                            checked={formData.selectedAddressIndex === index}
                            onChange={() => handleAddressSelect(index)}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{address.label}</p>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.locality}, {address.city}, {address.state} - {address.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message if no addresses */}
              {formData.addresses.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">
                    You need to add at least one address to become a wellness guide.
                  </p>
                </div>
              )}

              {/* Add New Address */}
              <div>
                {!showAddAddress ? (
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add New Address
                  </button>
                ) : (
                  <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          name="street"
                          value={newAddress.street}
                          onChange={handleNewAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Locality *
                        </label>
                        <input
                          type="text"
                          name="locality"
                          value={newAddress.locality}
                          onChange={handleNewAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={newAddress.state}
                          onChange={handleNewAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={newAddress.pincode}
                          onChange={handleNewAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          name="label"
                          value={newAddress.label}
                          onChange={handleNewAddressChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button
                        type="button"
                        onClick={addNewAddress}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Add Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Professional Information</h2>

              {/* Languages */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Languages (Select all that apply) *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableLanguages.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => handleLanguageChange(language)}
                        className="mr-2"
                      />
                      {language}
                    </label>
                  ))}
                </div>
              </div>

              {/* Area of Expertise */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area of Expertise *
                </label>
                <select
                  name="areaOfExpertise"
                  value={formData.areaOfExpertise}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your specialty</option>
                  {specialties.map((specialty) => (
                    <option key={specialty._id} value={specialty._id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Profile Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Description *
                </label>
                <textarea
                  name="profileDescription"
                  value={formData.profileDescription}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Describe your background, experience, and approach to wellness. Minimum 50 characters required."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.profileDescription.length}/1000 characters (minimum 50 required)
                </p>
              </div>

              {/* Profile Pictures */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Pictures (1-5 images) *
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select 1-5 professional photos. Supported formats: JPEG, PNG, GIF. Max 5MB each.
                </p>
                {profilePictures.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    {profilePictures.length} file(s) selected
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WellnessGuideForm;