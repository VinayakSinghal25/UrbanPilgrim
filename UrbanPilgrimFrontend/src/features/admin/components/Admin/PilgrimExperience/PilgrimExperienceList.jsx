// src/components/Admin/PilgrimExperience/PilgrimExperienceList.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import PilgrimExperienceCard from './PilgrimExperienceCard';
import { pilgrimExperienceApi } from '../../../../../services/pilgrimExperienceApi';

const PilgrimExperienceList = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const data = await pilgrimExperienceApi.getAll();
      setExperiences(data.pilgrimExperiences || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await pilgrimExperienceApi.delete(id);
      setExperiences(experiences.filter(exp => exp._id !== id));
    } catch (err) {
      alert('Failed to delete experience: ' + (err.message || 'Unknown error'));
    }
  };

  const filteredExperiences = experiences.filter(experience =>
    experience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    experience.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button 
          onClick={fetchExperiences}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pilgrim Experiences</h1>
          <p className="text-gray-600 mt-2">Manage your pilgrim experiences and itineraries</p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard/pilgrim-experiences/create')}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Experience
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search experiences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Experiences Grid */}
      {filteredExperiences.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No experiences found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new pilgrim experience.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/admin/dashboard/pilgrim-experiences/create')}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create New Experience
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiences.map((experience) => (
            <PilgrimExperienceCard
              key={experience._id}
              experience={experience}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PilgrimExperienceList;