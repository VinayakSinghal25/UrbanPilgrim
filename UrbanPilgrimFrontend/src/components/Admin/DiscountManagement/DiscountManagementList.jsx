// src/components/Admin/DiscountManagement/DiscountManagementList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon,
  UserIcon,
  TagIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { getAllWellnessGuideClassesForAdmin } from '../../../api/WellnessGuideClassApi';

const DiscountManagementList = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);

  useEffect(() => {
    fetchClasses();
  }, [currentPage, statusFilter]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter
      };

      const data = await getAllWellnessGuideClassesForAdmin(params);
      setClasses(data.classes || []);
      setTotalPages(data.totalPages || 1);
      setTotalClasses(data.totalClasses || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch wellness guide classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.wellnessGuide?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.wellnessGuide?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.specialty?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassClick = (classId) => {
    navigate(`/admin/dashboard/discount-management/${classId}`);
  };

  const getDiscountStatus = (adminSettings) => {
    const onlineEnabled = adminSettings?.onlineDiscount?.isEnabled || false;
    const offlineEnabled = adminSettings?.offlineDiscount?.isEnabled || false;
    
    if (onlineEnabled && offlineEnabled) {
      return { status: 'both', label: 'Online & Offline', color: 'bg-green-100 text-green-800 border-green-200' };
    } else if (onlineEnabled) {
      return { status: 'online', label: 'Online Only', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else if (offlineEnabled) {
      return { status: 'offline', label: 'Offline Only', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    } else {
      return { status: 'none', label: 'No Discounts', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const formatPrice = (price) => {
    return price ? `₹${price.toLocaleString()}` : 'N/A';
  };

  const getMaxDiscount = (discountConfig) => {
    if (!discountConfig?.isEnabled || !discountConfig?.tiers?.length) return 0;
    return Math.max(...discountConfig.tiers.map(tier => tier.discountPercentage));
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wellness guide classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Classes</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchClasses}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Discount Management</h1>
            <p className="text-gray-600">Set and manage discount settings for wellness guide classes</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <CurrencyDollarIcon className="h-4 w-4" />
              <span>Total Classes: {totalClasses}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search classes, guides, or specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending_approval">Pending</option>
              <option value="draft">Draft</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-12">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No wellness guide classes are available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClasses.map((classItem) => {
              const discountStatus = getDiscountStatus(classItem.adminSettings);
              const onlineMaxDiscount = getMaxDiscount(classItem.adminSettings?.onlineDiscount);
              const offlineMaxDiscount = getMaxDiscount(classItem.adminSettings?.offlineDiscount);

              return (
                <div
                  key={classItem._id}
                  className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleClassClick(classItem._id)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    {/* Class Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                            {classItem.title}
                          </h3>
                          
                          {/* Guide and Specialty */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>
                                {classItem.wellnessGuide?.user?.firstName} {classItem.wellnessGuide?.user?.lastName}
                              </span>
                            </div>
                            {classItem.specialty && (
                              <div className="flex items-center">
                                <TagIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                <span>{classItem.specialty.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Modes and Pricing */}
                          <div className="flex flex-wrap gap-3 mb-3">
                            {classItem.modes?.online?.enabled && (
                              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                                <GlobeAltIcon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">
                                  Online: {formatPrice(classItem.modes.online.price)}
                                </span>
                                {onlineMaxDiscount > 0 && (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                                    Up to {onlineMaxDiscount}% off
                                  </span>
                                )}
                              </div>
                            )}
                            {classItem.modes?.offline?.enabled && (
                              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-full">
                                <BuildingOfficeIcon className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium text-orange-700">
                                  Offline: {formatPrice(classItem.modes.offline.price)}
                                </span>
                                {offlineMaxDiscount > 0 && (
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                                    Up to {offlineMaxDiscount}% off
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex flex-col sm:items-end space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${discountStatus.color}`}>
                            {discountStatus.label}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            classItem.status === 'active' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : classItem.status === 'pending_approval'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {classItem.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-between lg:justify-end">
                      <div className="text-sm text-gray-500 lg:hidden">
                        Click to manage discounts
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 py-4 border-t border-gray-200">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManagementList; 