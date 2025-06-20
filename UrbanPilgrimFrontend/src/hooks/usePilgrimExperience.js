// src/hooks/usePilgrimExperiences.js
import { useState, useEffect } from 'react';
import { pilgrimExperienceApi } from '../services/pilgrimExperienceApi';

export const usePilgrimExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pilgrimExperienceApi.getAll();
      setExperiences(data.pilgrimExperiences || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch experiences');
      console.error('Error fetching experiences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const refetch = () => {
    fetchExperiences();
  };

  return {
    experiences,
    loading,
    error,
    refetch
  };
};

export default usePilgrimExperiences;