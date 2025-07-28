import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { GlobeAltIcon, BuildingOfficeIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import WellnessGuideClassCard from './WellnessGuideClassCard';
import { getAllApprovedClasses } from '../../../../api/WellnessGuideClassApi';
import FadeInSection from '../../../home/components/FadeInSection';

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
    navigate(`/class/${classId}`);
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
    <div>
      {/* Hero Section */}
      <div style={{
        width: '100%',
        height: '600px',
        overflow: 'hidden',
        position: 'relative',
        background: '#f8f8f8',
        marginBottom: '2rem',
      }}>
        <img
          src="/3.webp"
          alt="Wellness Guide Classes Hero"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>

      {/* Filter/Sort Bar */}
      <div style={{ 
        background: '#fff', 
        padding: '2rem 1rem 4rem 1rem', 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            fontSize: '1.1rem', 
            color: '#444' 
          }}>
            <span style={{ color: '#888' }}>Filter:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setCurrentPage(1);
              }}
              style={{ 
                border: '1px solid #ddd', 
                padding: '0.5rem', 
                borderRadius: '4px',
                background: 'white'
              }}
            >
              <option value="">All Specialties</option>
              {availableFilters.specialties.map(specialty => (
                <option key={specialty._id} value={specialty._id}>{specialty.name}</option>
              ))}
            </select>
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                setCurrentPage(1);
              }}
              style={{ 
                border: '1px solid #ddd', 
                padding: '0.5rem', 
                borderRadius: '4px',
                background: 'white'
              }}
            >
              <option value="">All Modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem', 
            fontSize: '1.1rem', 
            color: '#444' 
          }}>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{ 
                border: '1px solid #ddd', 
                padding: '0.5rem', 
                borderRadius: '4px',
                background: 'white'
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
            <span style={{ color: '#888' }}>{filteredClasses.length} classes</span>
          </div>
        </div>

        {/* Loading and Error Handling */}
        {loading && <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading...</div>}
        {error && <div style={{ textAlign: 'center', color: 'red', fontSize: '1.1rem' }}>{error}</div>}

        {/* Classes Grid */}
        <div className="wellness-classes-grid">
          {!loading && !error && filteredClasses.map((cls, idx) => (
            <div
              key={cls._id || idx}
              className="wellness-class-card"
              onClick={() => handleCardClick(cls._id)}
            >
              <img
                src={cls.photos?.[0] || '/fallback.jpg'}
                alt={cls.title || 'Wellness Class'}
                className="wellness-class-image"
              />
              <div style={{ padding: '1rem 0.5rem 0.5rem 0.5rem' }}>
                <div className="wellness-class-title">{cls.title}</div>
                <div className="wellness-class-price">
                  {cls.modes?.online?.price || cls.modes?.offline?.price 
                    ? `From Rs. ${Math.min(
                        cls.modes.online?.price || Infinity,
                        cls.modes.offline?.price || Infinity
                      ).toLocaleString('en-IN')}`
                    : 'Price on request'
                  }
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem', 
            marginTop: '3rem' 
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: currentPage === 1 ? '#f5f5f5' : 'white',
                color: currentPage === 1 ? '#999' : '#333',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <span style={{ color: '#666' }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: currentPage === totalPages ? '#f5f5f5' : 'white',
                color: currentPage === totalPages ? '#999' : '#333',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .wellness-classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 2.5rem;
        }
        
        .wellness-class-card {
          background: #fafafa;
          border-radius: 0px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: transform 0.3s ease;
          cursor: pointer;
          border: 1px solid #e0e0e0;
        }
        
        .wellness-class-card:hover {
          transform: scale(1.015);
        }
        
        .wellness-class-image {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }
        
        .wellness-class-title {
          font-size: 0.9rem;
          font-weight: 200;
          color: #333;
          min-height: 48px;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .wellness-class-price {
          font-size: 1.1rem;
          color: #444;
          font-weight: normal;
          text-align: left;
          margin-left: 0.5rem;
          margin-top: 0.5rem;
        }
        
        @media (min-width: 1200px) {
          .wellness-classes-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        @media (max-width: 1199px) and (min-width: 768px) {
          .wellness-classes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 767px) {
          .wellness-classes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default WellnessGuideClasses;