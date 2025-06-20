// src/components/PilgrimExperiences/PilgrimExperiences.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import PilgrimExperienceCard from './PilgrimExperienceCard';
import { pilgrimExperienceApi } from '../../services/pilgrimExperienceApi';

const PilgrimExperiences = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [filteredExperiences, setFilteredExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [experiences, searchTerm, selectedLocation, priceRange]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const data = await pilgrimExperienceApi.getAll();
      setExperiences(data.pilgrimExperiences || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch experiences');
      console.error('Error fetching experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterExperiences = () => {
    let filtered = [...experiences];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exp => 
        exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.whatToExpect && exp.whatToExpect.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(exp => 
        exp.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Price range filter
    if (priceRange) {
      filtered = filtered.filter(exp => {
        const price = exp.price || 0;
        switch (priceRange) {
          case 'under-25000':
            return price < 25000;
          case '25000-50000':
            return price >= 25000 && price <= 50000;
          case '50000-100000':
            return price >= 50000 && price <= 100000;
          case 'above-100000':
            return price > 100000;
          default:
            return true;
        }
      });
    }

    setFilteredExperiences(filtered);
  };

  const handleCardClick = (experienceId) => {
    navigate(`/pilgrim-experiences/${experienceId}`);
  };

  const getUniqueLocations = () => {
    const locations = experiences.map(exp => exp.location).filter(Boolean);
    return [...new Set(locations)];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLocation('');
    setPriceRange('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading spiritual experiences...</p>
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
            <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Experiences</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchExperiences}
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
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Pilgrim Experiences
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4 sm:px-0">
              Discover transformative spiritual journeys designed to nurture your soul and expand your consciousness. 
              Each experience is carefully crafted to provide you with deep insights and lasting inner peace.
            </p>
            {/* Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm sm:text-base text-gray-600">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" />
                <span>Sacred Destinations</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Expert Guides</span>
              </div>
              <div className="flex items-center">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Life-Changing</span>
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
                  placeholder="Search experiences, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Filters - Stack on mobile, row on tablet+ */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Location Filter */}
              <div className="flex-1 sm:flex-initial">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base"
                >
                  <option value="">All Locations</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="flex-1 sm:flex-initial">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm sm:text-base"
                >
                  <option value="">All Prices</option>
                  <option value="under-25000">Under ₹25,000</option>
                  <option value="25000-50000">₹25,000 - ₹50,000</option>
                  <option value="50000-100000">₹50,000 - ₹100,000</option>
                  <option value="above-100000">Above ₹100,000</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || selectedLocation || priceRange) && (
                <div className="flex-1 sm:flex-initial">
                  <button
                    onClick={clearFilters}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 underline text-center"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 sm:mb-6 px-2 sm:px-0">
          <p className="text-sm sm:text-base text-gray-600">
            {filteredExperiences.length === 0 ? 'No experiences found' : (
              <>
                Showing {filteredExperiences.length} of {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
                {(searchTerm || selectedLocation || priceRange) && (
                  <span className="ml-2 text-amber-600">
                    (filtered)
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Experiences Grid */}
        {filteredExperiences.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-gray-300">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">No experiences found</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                {searchTerm || selectedLocation || priceRange 
                  ? "Try adjusting your search criteria or filters to find more experiences."
                  : "Check back soon for new spiritual journeys and transformative experiences."
                }
              </p>
              {(searchTerm || selectedLocation || priceRange) && (
                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 text-sm sm:text-base"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {filteredExperiences.map((experience) => (
              <PilgrimExperienceCard
                key={experience._id}
                experience={experience}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PilgrimExperiences;