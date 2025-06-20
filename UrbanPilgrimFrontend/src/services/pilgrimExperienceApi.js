// src/services/pilgrimExperienceApi.js
import axios from 'axios';

// Use import.meta.env instead of process.env for Vite
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const pilgrimExperienceApi = {
  // Get all pilgrim experiences
  getAll: async () => {
    try {
      const response = await api.get('/pilgrim-experiences');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pilgrim experience by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/pilgrim-experiences/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new pilgrim experience
  create: async (formData) => {
    try {
      const response = await api.post('/pilgrim-experiences', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update pilgrim experience
  update: async (id, formData) => {
    try {
      const response = await api.put(`/pilgrim-experiences/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete pilgrim experience
  delete: async (id) => {
    try {
      const response = await api.delete(`/pilgrim-experiences/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate available dates for an experience
  generateDates: async (id, dateRange) => {
    try {
      const response = await api.post(`/pilgrim-experiences/${id}/generate-dates`, dateRange);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};