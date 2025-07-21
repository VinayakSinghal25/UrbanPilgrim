import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingWellnessGuideClasses, 
  updateWellnessGuideClassApproval 
} from '../../../../../api/WellnessGuideClassApi';
import { 
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  AcademicCapIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const PendingWellnessGuideClasses = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [pendingClasses, setPendingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPendingClasses();
  }, [currentPage]);

  const fetchPendingClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getPendingWellnessGuideClasses({
        page: currentPage,
        limit: 10
      });
      
      setPendingClasses(response.pendingClasses || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching pending classes:', error);
      setError(error.message || 'Failed to fetch pending classes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (classId) => {
    navigate(`/admin/dashboard/wellness-guide-class/${classId}`);
  };

  const handleQuickAction = async (classId, isApproved, rejectionReason = '') => {
    try {
      setActionLoading(prev => ({ ...prev, [classId]: true }));
      
      await updateWellnessGuideClassApproval(classId, isApproved, rejectionReason);
      
      // Remove the class from the pending list
      setPendingClasses(prev => prev.filter(cls => cls._id !== classId));
      
      alert(`Wellness guide class ${isApproved ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating approval status:', error);
      alert('Error updating approval status: ' + error.message);
    } finally {
      setActionLoading(prev => ({ ...prev, [classId]: false }));
    }
  };

  const handleReject = (classId) => {
    const rejectionReason = prompt('Please provide a reason for rejection:');
    if (rejectionReason && rejectionReason.trim()) {
      handleQuickAction(classId, false, rejectionReason.trim());
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getEnabledModes = (modes) => {
    const enabled = [];
    if (modes.online?.enabled) enabled.push('Online');
    if (modes.offline?.enabled) enabled.push('Offline');
    return enabled.join(', ');
  };

  if (loading && pendingClasses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Wellness Guide Classes</h1>
        <p className="text-gray-600 mt-2">Review and approve wellness guide class submissions.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPendingClasses}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {pendingClasses.length === 0 && !loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Classes</h3>
          <p className="text-gray-600">All wellness guide classes have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingClasses.map((classItem) => (
            <div key={classItem._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Class Header */}
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                      <AcademicCapIcon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {classItem.title}
                      </h3>
                      <p className="text-gray-600">
                        By {classItem.wellnessGuide?.user?.firstName} {classItem.wellnessGuide?.user?.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Class Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Specialty</label>
                      <p className="text-gray-900 flex items-center">
                        <AcademicCapIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {classItem.specialty?.name}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Modes Available</label>
                      <p className="text-gray-900 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {getEnabledModes(classItem.modes)}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Pricing</label>
                      <div className="text-gray-900">
                        {classItem.modes.online?.enabled && (
                          <p className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                            Online: {formatPrice(classItem.modes.online.price)}
                          </p>
                        )}
                        {classItem.modes.offline?.enabled && (
                          <p className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-400" />
                            Offline: {formatPrice(classItem.modes.offline.price)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Difficulty</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        classItem.difficulty === 'Beginner' 
                          ? 'bg-green-100 text-green-800'
                          : classItem.difficulty === 'Intermediate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {classItem.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 line-clamp-2">
                      {classItem.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {classItem.tags && classItem.tags.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-1">
                        {classItem.tags.slice(0, 4).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {classItem.tags.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{classItem.tags.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Offline Location */}
                  {classItem.modes.offline?.enabled && classItem.modes.offline.location && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {classItem.modes.offline.location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => handleViewDetails(classItem._id)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200 flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction(classItem._id, true)}
                    disabled={actionLoading[classItem._id]}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {actionLoading[classItem._id] ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleReject(classItem._id)}
                    disabled={actionLoading[classItem._id]}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors duration-200 flex items-center"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    {actionLoading[classItem._id] ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                <span>Submitted on: {new Date(classItem.createdAt).toLocaleDateString()}</span>
                <span>Class ID: {classItem._id.slice(-8)}</span>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PendingWellnessGuideClasses;