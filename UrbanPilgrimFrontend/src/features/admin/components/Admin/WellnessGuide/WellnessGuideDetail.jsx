import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getWellnessGuideByIdAdmin, updateWellnessGuideApproval } from '../../../../../api/wellnessGuideApi';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LanguageIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const WellnessGuideDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  
  const [wellnessGuide, setWellnessGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWellnessGuideDetails();
  }, [id]);

  const fetchWellnessGuideDetails = async () => {
    try {
      setLoading(true);
      const response = await getWellnessGuideByIdAdmin(token, id);
      setWellnessGuide(response.wellnessGuide);
    } catch (error) {
      console.error('Error fetching wellness guide details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (isApproved) => {
    try {
      setActionLoading(true);
      await updateWellnessGuideApproval(token, id, isApproved);
      
      // Update local state
      setWellnessGuide(prev => ({
        ...prev,
        isApproved,
        approvedAt: isApproved ? new Date() : null
      }));
      
      // Show success message and navigate back
      alert(`Wellness guide ${isApproved ? 'approved' : 'rejected'} successfully!`);
      navigate('/admin/dashboard/pending-wellness-guides');
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('Error updating approval status: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => navigate('/admin/dashboard/pending-wellness-guides')}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Go back to pending guides
        </button>
      </div>
    );
  }

  if (!wellnessGuide) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Wellness guide not found</p>
        <button
          onClick={() => navigate('/admin/dashboard/pending-wellness-guides')}
          className="mt-2 text-amber-600 hover:text-amber-800 underline"
        >
          Go back to pending guides
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/dashboard/pending-wellness-guides')}
          className="flex items-center text-amber-600 hover:text-amber-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Pending Guides
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {wellnessGuide.user?.firstName} {wellnessGuide.user?.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Wellness Guide Application</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              wellnessGuide.isApproved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {wellnessGuide.isApproved ? 'Approved' : 'Pending Review'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Pictures */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Pictures</h3>
            <div className="space-y-4">
              {wellnessGuide.profilePictures?.map((picture, index) => (
                <div key={index} className="relative">
                  <img
                    src={picture.url}
                    alt={`Profile ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {index + 1} of {wellnessGuide.profilePictures.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{wellnessGuide.user?.firstName} {wellnessGuide.user?.lastName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 flex items-center">
                  <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {wellnessGuide.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                <p className="text-gray-900 flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                  {wellnessGuide.contactNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900">
                  {wellnessGuide.gender === 'Others' && wellnessGuide.customGender 
                    ? wellnessGuide.customGender 
                    : wellnessGuide.gender}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {wellnessGuide.user?.address && wellnessGuide.user.address.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                Address Information
              </h3>
              <div className="space-y-4">
                {wellnessGuide.user.address.map((address, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{address.label || `Address ${index + 1}`}</h4>
                    </div>
                    <p className="text-gray-600">
                      {address.street}, {address.locality}<br />
                      {address.city}, {address.state} - {address.pincode}<br />
                      {address.country || 'India'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-500" />
              Professional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Area of Expertise</label>
                <div className="flex flex-wrap gap-2">
                  {wellnessGuide.areaOfExpertise?.map((specialty, index) => (
                    <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                      {specialty.name}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center">
                  <LanguageIcon className="h-4 w-4 mr-1" />
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {wellnessGuide.languages?.map((language, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Description */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {wellnessGuide.profileDescription}
            </p>
          </div>

          {/* Application Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Application Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Application submitted: </span>
                <span className="text-gray-900 ml-1">
                  {new Date(wellnessGuide.createdAt).toLocaleDateString()} at {new Date(wellnessGuide.createdAt).toLocaleTimeString()}
                </span>
              </div>
              {wellnessGuide.approvedAt && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Approved: </span>
                  <span className="text-gray-900 ml-1">
                    {new Date(wellnessGuide.approvedAt).toLocaleDateString()} at {new Date(wellnessGuide.approvedAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!wellnessGuide.isApproved && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleApproval(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
                
                <button
                  onClick={() => handleApproval(false)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <XMarkIcon className="h-5 w-5 mr-2" />
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WellnessGuideDetail;