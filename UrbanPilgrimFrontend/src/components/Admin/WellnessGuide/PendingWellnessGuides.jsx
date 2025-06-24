// src/components/Admin/WellnessGuide/PendingWellnessGuides.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  UserGroupIcon, 
  CheckIcon, 
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { getPendingWellnessGuides, updateWellnessGuideApproval } from '../../../api/wellnessGuideApi';

const PendingWellnessGuides = () => {
  const { token } = useSelector(state => state.auth);
  const [pendingGuides, setPendingGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPending, setTotalPending] = useState(0);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingGuides();
  }, [currentPage]);

  const fetchPendingGuides = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending guides with token:', token ? 'Token exists' : 'No token');
      
      const response = await getPendingWellnessGuides(token, currentPage, 10);
      
      setPendingGuides(response.pendingGuides);
      setTotalPages(response.totalPages);
      setTotalPending(response.totalPending);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch pending wellness guides');
      console.error('Error fetching pending guides:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (guideId, isApproved) => {
    try {
      setProcessingId(guideId);
      await updateWellnessGuideApproval(token, guideId, isApproved);
      
      // Remove the guide from the list
      setPendingGuides(guides => guides.filter(guide => guide._id !== guideId));
      setTotalPending(prev => prev - 1);
      
      // Show success message (you can add a toast notification here)
      alert(`Wellness guide ${isApproved ? 'approved' : 'rejected'} successfully`);
    } catch (err) {
      setError(err.message || 'Failed to update approval status');
      console.error('Error updating approval:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDetails = (guide) => {
    // For now, we'll just show an alert with basic details
    // Later, this can navigate to a detailed view page
    alert(`Guide Details:\nName: ${guide.user.firstName} ${guide.user.lastName}\nEmail: ${guide.email}\nContact: ${guide.contactNumber}\nGender: ${guide.gender}${guide.customGender ? ` (${guide.customGender})` : ''}\nDescription: ${guide.profileDescription}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Wellness Guide Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and approve wellness guide applications. Total pending: {totalPending}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {pendingGuides.length === 0 ? (
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-600">There are currently no wellness guide applications waiting for approval.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingGuides.map((guide) => (
            <div key={guide._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      {guide.profilePictures && guide.profilePictures.length > 0 ? (
                        <img
                          src={guide.profilePictures[0].url}
                          alt="Profile"
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserGroupIcon className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {guide.user.firstName} {guide.user.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Applied on {new Date(guide.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {guide.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {guide.contactNumber}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                      {guide.gender}{guide.customGender && ` (${guide.customGender})`}
                    </div>
                    {guide.user.address && guide.user.address.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {guide.user.address[0].city}, {guide.user.address[0].state}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Areas of Expertise:</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.areaOfExpertise && guide.areaOfExpertise.map((specialty) => (
                        <span
                          key={specialty._id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Languages:</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.languages && guide.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Profile Description:</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {guide.profileDescription}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => handleViewDetails(guide)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleApproval(guide._id, true)}
                    disabled={processingId === guide._id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {processingId === guide._id ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleApproval(guide._id, false)}
                    disabled={processingId === guide._id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    {processingId === guide._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default PendingWellnessGuides;