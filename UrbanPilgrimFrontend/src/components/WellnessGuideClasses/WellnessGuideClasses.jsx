import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import WellnessGuideClassCard from './WellnessGuideClassCard';
import { getAllApprovedClasses } from '../../api/WellnessGuideClassApi';

const WellnessGuideClasses = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClasses, setTotalClasses] = useState(0);
  const [availableFilters, setAvailableFilters] = useState({
    specialties: [],
    locations: []
  });

  useEffect(() => {
    fetchClasses();
  }, [currentPage, selectedSpecialty, selectedMode, selectedLocation, sortBy]);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        sortBy
      };
      
      if (selectedSpecialty) params.specialty = selectedSpecialty;
      if (selectedMode) params.mode = selectedMode;
      if (selectedLocation) params.location = selectedLocation;

      const data = await getAllApprovedClasses(params);
      setClasses(data.classes || []);
      setTotalPages(data.totalPages || 1);
      setTotalClasses(data.totalClasses || 0);
      setAvailableFilters(data.filters || { specialties: [], locations: [] });
    } catch (err) {
      setError(err.message || 'Failed to fetch wellness guide classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = [...classes];

    // Search filter (client-side for immediate feedback)
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cls.wellnessGuide?.user?.firstName && 
         `${cls.wellnessGuide.user.firstName} ${cls.wellnessGuide.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cls.specialty?.name && cls.specialty.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredClasses(filtered);
  };

  const handleCardClick = (classId) => {
    navigate(`/wellness-guide-classes/${classId}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedMode('');
    setSelectedLocation('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading wellness guide classes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Classes</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchClasses}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Wellness Guide Classes
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4 sm:px-0">
              Discover expert-led wellness classes designed to enhance your physical, mental, and spiritual well-being. 
              Connect with certified wellness guides and transform your journey to holistic health.
            </p>
            {/* Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm sm:text-base text-gray-600">
              <div className="flex items-center">
                <GlobeAltIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-500" />
                <span>Online & Offline</span>
              </div>
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-500" />
                <span>Expert Guides</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Certified Programs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="space-y-4">
            {/* Search - Full width on mobile */}
            <div className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search classes, guides, specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters - Stack on mobile, row on tablet+ */}
            <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
              {/* Specialty Filter */}
              <div className="flex-1">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => {
                    setSelectedSpecialty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                >
                  <option value="">All Specialties</option>
                  {availableFilters.specialties.map(specialty => (
                    <option key={specialty._id} value={specialty._id}>{specialty.name}</option>
                  ))}
                </select>
              </div>

              {/* Mode Filter */}
              <div className="flex-1">
                <select
                  value={selectedMode}
                  onChange={(e) => {
                    setSelectedMode(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                >
                  <option value="">All Modes</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="flex-1">
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                >
                  <option value="">All Locations</option>
                  {availableFilters.locations.map((location, index) => (
                    <option key={index} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm sm:text-base"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* Clear Filters Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={clearFilters}
                  className="w-full lg:w-auto px-4 py-3 sm:py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
          <div className="text-gray-600">
            <span className="text-sm sm:text-base">
              Showing {filteredClasses.length} of {totalClasses} wellness guide classes
            </span>
          </div>
        </div>

        {/* Classes Grid */}
        {filteredClasses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredClasses.map((wellnessClass) => (
                <WellnessGuideClassCard
                  key={wellnessClass._id}
                  wellnessClass={wellnessClass}
                  onClick={handleCardClick}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const startPage = Math.max(1, currentPage - 2);
                  const pageNumber = startPage + i;
                  if (pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNumber
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* No Results */
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedSpecialty || selectedMode || selectedLocation
                ? 'Try adjusting your search criteria or filters'
                : 'No wellness guide classes are available at the moment'}
            </p>
            {(searchTerm || selectedSpecialty || selectedMode || selectedLocation) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessGuideClasses; 