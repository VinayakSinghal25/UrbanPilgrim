import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getWellnessGuideProfile } from '../api/wellnessGuideApi';
import { getMyClasses } from '../api/wellnessGuideClassApi';

const WellnessGuideDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [wellnessGuide, setWellnessGuide] = useState(null);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                      return (
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-gray-900">No Upcoming Classes</p>
                          <p className="text-sm text-gray-600">Add time slots to schedule classes</p>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <button
                    onClick={() => navigate(`/wellness-guide/class/${currentClass._id}`)}
                    className="ml-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Management Actions */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessGuideDashboard;