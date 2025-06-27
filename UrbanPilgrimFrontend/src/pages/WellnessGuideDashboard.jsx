import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getWellnessGuideProfile } from '../api/wellnessGuideApi';
import { getMyClasses, getClassDetails } from '../api/WellnessGuideClassApi';

const WellnessGuideDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [wellnessGuide, setWellnessGuide] = useState(null);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClassDetails, setSelectedClassDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch wellness guide profile
      const profileResponse = await getWellnessGuideProfile();
      setWellnessGuide(profileResponse.wellnessGuide);
      
      // If approved, fetch classes
      if (profileResponse.wellnessGuide.isApproved) {
        const classesResponse = await getMyClasses();
        setMyClasses(classesResponse.classes || []);
      }
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getNextClassTime = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return null;
    
    const now = new Date();
    const futureSlots = timeSlots
      .filter(slot => new Date(slot.startTimeUTC) > now)
      .sort((a, b) => new Date(a.startTimeUTC) - new Date(b.startTimeUTC));
    
    return futureSlots.length > 0 ? futureSlots[0] : null;
  };

  const formatDateTime = (dateTimeUTC) => {
    const date = new Date(dateTimeUTC);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const fetchClassDetails = async (classId) => {
    try {
      setDetailsLoading(true);
      const response = await getClassDetails(classId);
      setSelectedClassDetails(response.classDetails);
    } catch (err) {
      console.error('Error fetching class details:', err);
      setError('Failed to load class details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDetailsModal = (classData) => {
    setShowDetailsModal(true);
    setSelectedClassDetails(classData);
    // Fetch detailed data
    fetchClassDetails(classData._id);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedClassDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleModalBackdropClick = (e) => {
    // Close modal only if clicking on the backdrop (not the modal content)
    if (e.target === e.currentTarget) {
      closeDetailsModal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!wellnessGuide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wellness Guide Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Please apply to become a wellness guide first.</p>
          <button
            onClick={() => navigate('/wellness-guide-form')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Apply to Become Wellness Guide
          </button>
        </div>
      </div>
    );
  }

  // Application pending - show only status
  if (!wellnessGuide.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Wellness Guide Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Hello {user?.firstName}! Your application is under review.
              </p>
            </div>
          </div>
        </div>

        {/* Pending Status */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-yellow-900 mb-4">
              Application Under Review
            </h2>
            <p className="text-yellow-700 mb-6 max-w-2xl mx-auto">
              Thank you for applying to become a wellness guide. Our admin team is currently reviewing your application. You'll receive an email notification once the review is complete.
            </p>
            <div className="bg-white rounded-lg p-6 max-w-lg mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Admin team reviews your credentials
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Email notification with decision
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Start creating wellness classes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved wellness guide - show full dashboard
  const hasClass = myClasses && myClasses.length > 0;
  const currentClass = hasClass ? myClasses[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Wellness Guide Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.firstName}! Manage your wellness classes and schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasClass ? (
          // No class created - show create class option
          <div className="text-center">
            <div className="bg-white rounded-lg shadow p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Create Your First Wellness Class
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                You're now an approved wellness guide! Start your journey by creating your wellness class. 
                Define your specialty, set your schedule, and begin helping others on their wellness journey.
              </p>
              <button
                onClick={() => navigate('/wellness-guide/create-class')}
                className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 font-medium"
              >
                Create Your Class
              </button>
            </div>
          </div>
        ) : (
          // Has class - show class details and management options
          <div className="space-y-6">
            {/* Class Details Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h2 className="text-xl font-bold text-gray-900 mr-3">
                        {currentClass.title}
                      </h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentClass.status)}`}>
                        {currentClass.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {truncateText(currentClass.description)}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Specialty</p>
                        <p className="text-sm text-gray-900">
                          {currentClass.specialty?.name || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Difficulty</p>
                        <p className="text-sm text-gray-900">{currentClass.difficulty}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Modes Available</p>
                        <div className="flex space-x-2">
                          {currentClass.modes?.online?.enabled && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Online
                            </span>
                          )}
                          {currentClass.modes?.offline?.enabled && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Offline
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Next Class Time */}
                    {(() => {
                      const nextSlot = getNextClassTime(currentClass.timeSlots);
                      if (nextSlot) {
                        const { date, time } = formatDateTime(nextSlot.startTimeUTC);
                        return (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-blue-900">Next Class</p>
                            <p className="text-sm text-blue-700">{date} at {time} ({nextSlot.mode})</p>
                          </div>
                        );
                      }
                      
                      // Different messages based on class status
                      if (currentClass.status === 'pending_approval') {
                        return (
                          <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-yellow-900">Classes Scheduled</p>
                            <p className="text-sm text-yellow-700">Time slots generated, awaiting admin approval to go live</p>
                          </div>
                        );
                      } else if (currentClass.status === 'active') {
                        return (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-900">No Upcoming Classes</p>
                            <p className="text-sm text-gray-600">Add time slots to schedule classes</p>
                          </div>
                        );
                      } else {
                        return (
                          <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-gray-900">No Classes Scheduled</p>
                            <p className="text-sm text-gray-600">Complete class setup to schedule classes</p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  
                  <button
                    onClick={() => openDetailsModal(currentClass)}
                    className="ml-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Management Actions */}
            {/* Only show slot management for active classes */}
            {currentClass.status === 'active' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Recurring Time Slots */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Add Recurring Slots</h3>
                      <p className="text-sm text-gray-600">Extend your class schedule with recurring time slots</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/wellness-guide/class/${currentClass._id}/add-recurring-slots`)}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium"
                  >
                    Add Recurring Slots
                  </button>
                </div>

                {/* Add Single Time Slots */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Add Single Slots</h3>
                      <p className="text-sm text-gray-600">Add individual time slots for specific dates</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/wellness-guide/class/${currentClass._id}/add-single-slots`)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
                  >
                    Add Single Slots
                  </button>
                </div>
              </div>
            )}

            {/* Status-specific information for non-active classes */}
            {currentClass.status !== 'active' && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  {currentClass.status === 'pending_approval' && (
                    <>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Awaiting Admin Approval</h3>
                      <p className="text-gray-600 mb-4">
                        Your class is currently under review by our admin team. Once approved, you'll be able to manage time slots and students can start booking.
                      </p>
                    </>
                  )}
                  
                  {currentClass.status === 'draft' && (
                    <>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Draft Class</h3>
                      <p className="text-gray-600 mb-4">
                        Your class is still in draft mode. Complete the setup and submit for approval to start accepting bookings.
                      </p>
                      <button
                        onClick={() => navigate(`/wellness-guide/edit-class/${currentClass._id}`)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                      >
                        Complete Setup
                      </button>
                    </>
                  )}
                  
                  {currentClass.status === 'rejected' && (
                    <>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Class Rejected</h3>
                      <p className="text-gray-600 mb-2">
                        Your class was not approved. Please review the feedback and resubmit.
                      </p>
                      {currentClass.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-700">
                            <strong>Reason:</strong> {currentClass.rejectionReason}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/wellness-guide/edit-class/${currentClass._id}`)}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium"
                      >
                        Edit & Resubmit
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

             {/* Details Modal */}
       {showDetailsModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleModalBackdropClick}>
           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             {/* Modal Header */}
             <div className="flex items-center justify-between p-6 border-b border-gray-200">
               <h2 className="text-2xl font-bold text-gray-900">Class Details</h2>
               <button
                 onClick={closeDetailsModal}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
                 aria-label="Close modal"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                 </svg>
               </button>
             </div>

             {/* Modal Content */}
             <div className="p-6">
               {detailsLoading ? (
                 <div className="flex items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                   <p className="ml-4 text-gray-600">Loading class details...</p>
                 </div>
               ) : selectedClassDetails ? (
                 <div className="space-y-6">
                   {/* Photos Display */}
                   {selectedClassDetails.photos && selectedClassDetails.photos.length > 0 && (
                     <div>
                       <h3 className="text-lg font-medium text-gray-900 mb-3">Class Photos</h3>
                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                         {selectedClassDetails.photos.map((photo, index) => (
                           <div key={index} className="relative group">
                             <img
                               src={photo}
                               alt={`Class photo ${index + 1}`}
                               className="w-full h-32 object-cover rounded-lg border border-gray-200"
                             />
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Review Section - Same as Step 7 */}
                   <div className="bg-gray-50 rounded-lg p-6">
                     <h3 className="text-lg font-medium text-gray-900 mb-4">Class Information</h3>
                     
                     <div className="space-y-4">
                       {/* Basic Information Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <span className="text-sm font-medium text-gray-500">Title:</span>
                           <p className="text-sm text-gray-900">{selectedClassDetails.title || 'Not provided'}</p>
                         </div>
                         <div>
                           <span className="text-sm font-medium text-gray-500">Specialty:</span>
                           <p className="text-sm text-gray-900">
                             {selectedClassDetails.specialty?.name || 'Not selected'}
                           </p>
                         </div>
                         <div>
                           <span className="text-sm font-medium text-gray-500">Difficulty:</span>
                           <p className="text-sm text-gray-900">{selectedClassDetails.difficulty}</p>
                         </div>
                         <div>
                           <span className="text-sm font-medium text-gray-500">Timezone:</span>
                           <p className="text-sm text-gray-900">{selectedClassDetails.timezone}</p>
                         </div>
                       </div>

                       {/* Description */}
                       <div>
                         <span className="text-sm font-medium text-gray-500">Description:</span>
                         <p className="text-sm text-gray-900 mt-1">{selectedClassDetails.description || 'No description provided'}</p>
                       </div>

                       {/* Modes */}
                       <div>
                         <span className="text-sm font-medium text-gray-500">Modes:</span>
                         <div className="flex gap-2 mt-1">
                           {selectedClassDetails.modes?.online?.enabled && (
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                               Online: ₹{selectedClassDetails.modes.online.price}/session (max {selectedClassDetails.modes.online.maxCapacity})
                             </span>
                           )}
                           {selectedClassDetails.modes?.offline?.enabled && (
                             <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                               Offline: ₹{selectedClassDetails.modes.offline.price}/session (max {selectedClassDetails.modes.offline.maxCapacity})
                               {selectedClassDetails.modes.offline.location && ` - ${selectedClassDetails.modes.offline.location}`}
                             </span>
                           )}
                         </div>
                       </div>

                                               {/* Online Schedule */}
                        {selectedClassDetails.modes?.online?.enabled && selectedClassDetails.scheduleConfig?.online && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Online Schedule:</span>
                            <div className="text-sm text-gray-900 mt-1 space-y-1">
                              <p><strong>Days:</strong> {selectedClassDetails.scheduleConfig.online.selectedDays?.join(', ') || 'None selected'}</p>
                              <p><strong>Period:</strong> {formatDate(selectedClassDetails.scheduleConfig.online.dateRange?.startDate)} to {formatDate(selectedClassDetails.scheduleConfig.online.dateRange?.endDate)}</p>
                             <div>
                               <strong>Time Slots ({selectedClassDetails.scheduleConfig.online.timeSlots?.length || 0}):</strong>
                               {selectedClassDetails.scheduleConfig.online.timeSlots?.length > 0 ? (
                                 <div className="mt-1 flex flex-wrap gap-1">
                                   {selectedClassDetails.scheduleConfig.online.timeSlots.map((slot, index) => (
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

                                               {/* Offline Schedule */}
                        {selectedClassDetails.modes?.offline?.enabled && selectedClassDetails.scheduleConfig?.offline && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Offline Schedule:</span>
                            <div className="text-sm text-gray-900 mt-1 space-y-1">
                              <p><strong>Days:</strong> {selectedClassDetails.scheduleConfig.offline.selectedDays?.join(', ') || 'None selected'}</p>
                              <p><strong>Period:</strong> {formatDate(selectedClassDetails.scheduleConfig.offline.dateRange?.startDate)} to {formatDate(selectedClassDetails.scheduleConfig.offline.dateRange?.endDate)}</p>
                             <div>
                               <strong>Time Slots ({selectedClassDetails.scheduleConfig.offline.timeSlots?.length || 0}):</strong>
                               {selectedClassDetails.scheduleConfig.offline.timeSlots?.length > 0 ? (
                                 <div className="mt-1 flex flex-wrap gap-1">
                                   {selectedClassDetails.scheduleConfig.offline.timeSlots.map((slot, index) => (
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

                       {/* Offline Address */}
                       {selectedClassDetails.modes?.offline?.enabled && selectedClassDetails.modes?.offline?.address && (
                         <div>
                           <span className="text-sm font-medium text-gray-500">Offline Address:</span>
                           <p className="text-sm text-gray-900 mt-1">
                             {[
                               selectedClassDetails.modes.offline.address.street,
                               selectedClassDetails.modes.offline.address.city,
                               selectedClassDetails.modes.offline.address.state,
                               selectedClassDetails.modes.offline.address.zipCode || selectedClassDetails.modes.offline.address.pincode,
                               selectedClassDetails.modes.offline.address.country
                             ].filter(Boolean).join(', ')}
                             {selectedClassDetails.modes.offline.address.landmark && (
                               <span className="text-gray-500"> (Near: {selectedClassDetails.modes.offline.address.landmark})</span>
                             )}
                           </p>
                         </div>
                       )}

                       {/* Tags */}
                       <div>
                         <span className="text-sm font-medium text-gray-500">Tags:</span>
                         <div className="mt-1">
                           {selectedClassDetails.tags && selectedClassDetails.tags.length > 0 ? (
                             <div className="flex flex-wrap gap-1">
                               {selectedClassDetails.tags.map((tag, index) => (
                                 <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                   {tag}
                                 </span>
                               ))}
                             </div>
                           ) : (
                             <p className="text-sm text-gray-900">None</p>
                           )}
                         </div>
                       </div>

                       {/* Photos Count */}
                       <div>
                         <span className="text-sm font-medium text-gray-500">Photos:</span>
                         <p className="text-sm text-gray-900">
                           {selectedClassDetails.photos?.length || 0} photo(s) uploaded
                         </p>
                       </div>

                       {/* Certifications */}
                       <div>
                         <span className="text-sm font-medium text-gray-500">Guide Certifications:</span>
                         <div className="mt-1">
                           {selectedClassDetails.guideCertifications && selectedClassDetails.guideCertifications.length > 0 ? (
                             <ul className="list-disc list-inside space-y-1">
                               {selectedClassDetails.guideCertifications.map((cert, index) => (
                                 <li key={index} className="text-sm text-gray-900">{cert}</li>
                               ))}
                             </ul>
                           ) : (
                             <p className="text-sm text-gray-900">No certifications listed</p>
                           )}
                         </div>
                       </div>

                       {/* Skills to Learn */}
                       <div>
                         <span className="text-sm font-medium text-gray-500">Skills Students Will Learn:</span>
                         <div className="mt-1">
                           {selectedClassDetails.skillsToLearn && selectedClassDetails.skillsToLearn.length > 0 ? (
                             <ul className="list-disc list-inside space-y-1">
                               {selectedClassDetails.skillsToLearn.map((skill, index) => (
                                 <li key={index} className="text-sm text-gray-900">{skill}</li>
                               ))}
                             </ul>
                           ) : (
                             <p className="text-sm text-gray-900">No specific skills listed</p>
                           )}
                         </div>
                       </div>

                       {/* About Sections */}
                       {selectedClassDetails.aboutSections && selectedClassDetails.aboutSections.length > 0 && (
                         <div>
                           <span className="text-sm font-medium text-gray-500">About Sections:</span>
                           <div className="mt-2 space-y-3">
                             {selectedClassDetails.aboutSections.map((section, index) => (
                               section.header && section.paragraph && (
                                 <div key={index} className="border-l-4 border-blue-200 pl-4">
                                   <h4 className="text-sm font-medium text-gray-900">{section.header}</h4>
                                   <p className="text-sm text-gray-700 mt-1">{section.paragraph}</p>
                                 </div>
                               )
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <p className="text-gray-500">No class details available</p>
                 </div>
               )}
             </div>

             {/* Modal Footer */}
             <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
               <button
                 onClick={closeDetailsModal}
                 className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 font-medium transition-colors"
               >
                 Close
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default WellnessGuideDashboard;