// src/components/Profile/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfile, updateUserProfile, updateUserPassword } from "../../../../api/userApi";
import { 
  updateUserStart, 
  updateUserSuccess, 
  updateUserFailure,
} from "../../../../slices/authSlice";

export default function UserProfile() {
  const dispatch = useDispatch();
  const { user, token, loading, error } = useSelector((state) => state.auth);
  
  // States for editable fields
  const [accountDetails, setAccountDetails] = useState({
    name: '',
    email: '',
    contactNumber: ''
  });

  // Track which field is being edited
  const [editingField, setEditingField] = useState(null);
  
  // Track temporary values during editing
  const [tempValues, setTempValues] = useState({});
  
  // Track if any changes have been made
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store original values to compare changes
  const [originalValues, setOriginalValues] = useState({});
  const [originalAddresses, setOriginalAddresses] = useState([]);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addresses, setAddresses] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "", 
    locality: "", 
    city: "", 
    state: "", 
    pincode: "", 
    country: "India", 
    label: "Home"
  });

  // Load user data on component mount
  useEffect(() => {
    if (token) {
      loadUserProfile();
    }
  }, [token]);

  const loadUserProfile = async () => {
    try {
      dispatch(updateUserStart());
      const userData = await getUserProfile(token);
      
      const userDetails = {
        name: userData.name || '',
        email: userData.email || '',
        contactNumber: userData.contactNumber || ''
      };
      
      setAccountDetails(userDetails);
      setOriginalValues(userDetails);
      
      const userAddresses = userData.address || [];
      setAddresses(userAddresses);
      setOriginalAddresses(userAddresses);
      
      dispatch(updateUserSuccess({ user: userData }));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  // Check if there are any changes
  const checkForChanges = (updatedDetails = accountDetails, updatedAddresses = addresses) => {
    const detailsChanged = Object.keys(updatedDetails).some(
      key => updatedDetails[key] !== originalValues[key]
    );
    
    const addressesChanged = JSON.stringify(updatedAddresses) !== JSON.stringify(originalAddresses);
    
    return detailsChanged || addressesChanged;
  };

  // Handle starting edit mode for a field
  const startEdit = (field) => {
    setEditingField(field);
    setTempValues({ ...tempValues, [field]: accountDetails[field] });
  };

  // Handle saving a field
  const saveField = (field) => {
    const newValue = tempValues[field];
    const updatedDetails = { ...accountDetails, [field]: newValue };
    
    setAccountDetails(updatedDetails);
    setEditingField(null);
    
    // Check if there are any changes
    setHasChanges(checkForChanges(updatedDetails, addresses));
  };

  // Handle canceling edit
  const cancelEdit = () => {
    setEditingField(null);
    setTempValues({});
  };

  // Handle input change during editing
  const handleFieldChange = (field, value) => {
    setTempValues({ ...tempValues, [field]: value });
  };

  // Handle password change
  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    try {
      dispatch(updateUserStart());
      
      const updateData = {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      };
      
      await updateUserPassword(token, updateData);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      
      dispatch(updateUserSuccess({ user }));
      alert("Password updated successfully!");
      
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      alert(`Error: ${error.message}`);
    }
  };

  const handleAddAddress = () => {
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    setNewAddress({ 
      street: "", 
      locality: "", 
      city: "", 
      state: "", 
      pincode: "", 
      country: "India", 
      label: "Home" 
    });
    setShowAdd(false);
    
    // Check for changes after adding address
    setHasChanges(checkForChanges(accountDetails, updatedAddresses));
  };

  const handleChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      dispatch(updateUserStart());
      
      // Prepare data to send to backend - include ALL current data
      const updateData = {
        name: accountDetails.name,
        email: accountDetails.email,
        contactNumber: accountDetails.contactNumber,
        address: addresses // This will include all addresses including newly added ones
      };
      
      console.log('Sending update data:', updateData); // Debug log
      
      const response = await updateUserProfile(token, updateData);
      
      // Update original values after successful update
      setOriginalValues(accountDetails);
      setOriginalAddresses(addresses);
      setHasChanges(false);
      
      // Update Redux state
      dispatch(updateUserSuccess(response));
      
      alert("Profile updated successfully!");
      
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      alert(`Error: ${error.message}`);
    }
  };

  // Show loading spinner while loading
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-600 to-red-500 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-lg">
                {user?.profilePictures?.[0]?.url ? (
                  <img
                    src={user.profilePictures[0].url}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                    </svg>
                    <span className="text-xs sm:text-sm text-gray-500 font-medium">+ Add</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Greeting */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Hi, {accountDetails.name || 'User'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Account Details Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-4 sm:px-6 py-5">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Account Details</h2>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Name Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                  <span className="text-gray-700 font-medium min-w-0 sm:min-w-[120px] text-sm sm:text-base">
                    Full Name
                  </span>
                  <div className="flex-1 max-w-md">
                    {editingField === 'name' ? (
                      <input
                        type="text"
                        value={tempValues.name || ''}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900 font-medium text-sm sm:text-base">
                        {accountDetails.name || 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'name' ? (
                    <>
                      <button 
                        onClick={() => saveField('name')}
                        className="text-green-500 hover:text-green-600 p-1 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-600 p-1 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => startEdit('name')}
                      className="text-red-500 hover:text-red-600 flex items-center space-x-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium text-sm sm:text-base">Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Email Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                  <span className="text-gray-700 font-medium min-w-0 sm:min-w-[120px] text-sm sm:text-base">
                    Email Address
                  </span>
                  <div className="flex-1 max-w-md">
                    {editingField === 'email' ? (
                      <input
                        type="email"
                        value={tempValues.email || ''}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900 font-medium text-sm sm:text-base break-all">
                        {accountDetails.email || 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'email' ? (
                    <>
                      <button 
                        onClick={() => saveField('email')}
                        className="text-green-500 hover:text-green-600 p-1 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-600 p-1 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => startEdit('email')}
                      className="text-red-500 hover:text-red-600 flex items-center space-x-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium text-sm sm:text-base">Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                  <span className="text-gray-700 font-medium min-w-0 sm:min-w-[120px] text-sm sm:text-base">
                    Contact Number
                  </span>
                  <div className="flex-1 max-w-md">
                    {editingField === 'contactNumber' ? (
                      <input
                        type="tel"
                        value={tempValues.contactNumber || ''}
                        onChange={(e) => handleFieldChange('contactNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                        autoFocus
                      />
                    ) : (
                      <span className="text-gray-900 font-medium text-sm sm:text-base">
                        {accountDetails.contactNumber || 'Not set'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'contactNumber' ? (
                    <>
                      <button 
                        onClick={() => saveField('contactNumber')}
                        className="text-green-500 hover:text-green-600 p-1 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={cancelEdit}
                        className="text-gray-500 hover:text-gray-600 p-1 rounded transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => startEdit('contactNumber')}
                      className="text-red-500 hover:text-red-600 flex items-center space-x-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium text-sm sm:text-base">Edit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Password Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
                  <span className="text-gray-700 font-medium min-w-0 sm:min-w-[120px] text-sm sm:text-base">
                    Password
                  </span>
                  <div className="flex-1 max-w-md">
                    <span className="text-gray-900 font-medium text-sm sm:text-base">
                      ••••••••
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-red-500 hover:text-red-600 flex items-center space-x-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span className="font-medium text-sm sm:text-base">Change Password</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        {showPasswordChange && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-4 sm:px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Address Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-4 sm:px-6 py-5">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Addresses</h3>
              {addresses.length === 0 && <p className="text-gray-500">No addresses added.</p>}
              <ul>
                {addresses.map((addr, idx) => (
                  <li key={idx} className="mb-2 p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-blue-600">{addr.label}:</span> 
                    <span className="ml-2">
                      {[addr.street, addr.locality, addr.city, addr.state, addr.pincode, addr.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </li>
                ))}
              </ul>
              {showAdd ? (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="street" 
                      placeholder="Street" 
                      value={newAddress.street} 
                      onChange={handleChange} 
                    />
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="locality" 
                      placeholder="Locality" 
                      value={newAddress.locality} 
                      onChange={handleChange} 
                    />
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="city" 
                      placeholder="City" 
                      value={newAddress.city} 
                      onChange={handleChange} 
                    />
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="state" 
                      placeholder="State" 
                      value={newAddress.state} 
                      onChange={handleChange} 
                    />
                    <input 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="pincode" 
                      placeholder="Pincode" 
                      value={newAddress.pincode} 
                      onChange={handleChange} 
                    />
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="country" 
                      value={newAddress.country} 
                      onChange={handleChange}
                    >
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="mt-3">
                    <select 
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      name="label" 
                      value={newAddress.label} 
                      onChange={handleChange}
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium" 
                      type="button" 
                      onClick={handleAddAddress}
                    >
                      Add Address
                    </button>
                    <button 
                      className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium" 
                      type="button" 
                      onClick={() => setShowAdd(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-3 transition-colors font-medium" 
                  type="button" 
                  onClick={() => setShowAdd(true)}
                >
                  <span className="mr-1">+</span> Add Address
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Update Profile Button - Separate Section */}
        <div className="flex justify-center">
          <button 
            disabled={!hasChanges || loading}
            className={`py-4 px-8 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
              hasChanges && !loading
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transform hover:scale-105 focus:ring-blue-500 shadow-lg cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={hasChanges && !loading ? handleUpdate : undefined}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </div>
            ) : (
              'Update Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}