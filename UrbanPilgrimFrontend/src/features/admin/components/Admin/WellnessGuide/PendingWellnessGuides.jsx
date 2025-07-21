import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getPendingWellnessGuides, updateWellnessGuideApproval } from '../../../../../api/wellnessGuideApi';
import { 
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const PendingWellnessGuides = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [pendingGuides, setPendingGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingGuides();
  }, [currentPage]);

  const fetchPendingGuides = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPendingWellnessGuides(token, currentPage, 10);
      console.log('Fetched pending guides:', response);
      
      setPendingGuides(response.pendingGuides || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching pending guides:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (guideId) => {
    navigate(`/admin/dashboard/wellness-guide/${guideId}`);
  };

  const handleQuickAction = async (guideId, isApproved) => {
    try {
      setActionLoading(prev => ({ ...prev, [guideId]: true }));
      
      await updateWellnessGuideApproval(token, guideId, isApproved);
      
      // Remove the guide from the pending list
      setPendingGuides(prev => prev.filter(guide => guide._id !== guideId));
      
      alert(`Wellness guide ${isApproved ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('Error updating approval status: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [guideId]: false }));
    }
  };

  if (loading && pendingGuides.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Wellness Guide Applications</h1>
        <p className="text-gray-600 mt-2">Review and approve wellness guide applications from users.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPendingGuides}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {pendingGuides.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
          <p className="text-gray-600">All wellness guide applications have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingGuides.map((guide) => (
            <div key={guide._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      {guide.profilePictures && guide.profilePictures.length > 0 ? (
                        <img
                          src={guide.profilePictures[0].url}
                          alt="Profile"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {guide.user?.firstName} {guide.user?.lastName}
                      </h3>
                      <p className="text-gray-600 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {guide.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Contact Number</label>
                      <p className="text-gray-900 flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {guide.contactNumber}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-gray-900">
                        {guide.gender === 'Others' && guide.customGender 
                          ? guide.customGender 
                          : guide.gender}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Languages</label>
                      <div className="flex flex-wrap gap-1">
                        {guide.languages?.slice(0, 2).map((language, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {language}
                          </span>
                        ))}
                        {guide.languages?.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{guide.languages.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Area of Expertise</label>
                    <div className="flex flex-wrap gap-2">
                      {guide.areaOfExpertise?.map((specialty, index) => (
                        <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {guide.user?.address && guide.user.address.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-1">Primary Address</label>
                      <p className="text-gray-900 flex items-start">
                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {guide.user.address[0].street}, {guide.user.address[0].locality}, {guide.user.address[0].city}, {guide.user.address[0].state} - {guide.user.address[0].pincode}
                        </span>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Profile Description</label>
                    <p className="text-gray-700 line-clamp-3">
                      {guide.profileDescription?.length > 150 
                        ? `${guide.profileDescription.substring(0, 150)}...` 
                        : guide.profileDescription}
                    </p>
                  </div>
                </div>

                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => handleViewDetails(guide._id)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction(guide._id, true)}
                    disabled={actionLoading[guide._id]}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {actionLoading[guide._id] ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction(guide._id, false)}
                    disabled={actionLoading[guide._id]}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    {actionLoading[guide._id] ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                <span>Applied on: {new Date(guide.createdAt).toLocaleDateString()}</span>
                <span>Application ID: {guide._id.slice(-8)}</span>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PendingWellnessGuides;