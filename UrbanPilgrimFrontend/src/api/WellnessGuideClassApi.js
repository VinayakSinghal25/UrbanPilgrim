// src/api/wellnessGuideClassApi.js
import axios from 'axios';
import { getTokenFromCookie } from '../utils/cookies';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: `${API_URL}/api/wellness-guide-classes`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get token (same pattern as working API files)
const getAuthToken = () => {
  // Try cookies first, then fallback to localStorage
  let token = getTokenFromCookie();
  if (!token) {
    token = localStorage.getItem('token');
  }
  return token;
};

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Get all approved wellness guide classes (Public)
export const getAllApprovedClasses = async (params = {}) => {
  try {
    const response = await apiClient.get('/', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get my classes
export const getMyClasses = async (params = {}) => {
  try {
    const response = await apiClient.get('/my/classes', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get my addresses
export const getMyAddresses = async () => {
  try {
    const response = await apiClient.get('/my/addresses');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create wellness guide class
export const createWellnessGuideClass = async (formData) => {
  try {
    const response = await apiClient.post('/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update wellness guide class
export const updateWellnessGuideClass = async (classId, formData) => {
  try {
    const response = await apiClient.put(`/${classId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update class details (non-schedule changes)
export const updateClassDetails = async (classId, formData) => {
  try {
    const response = await apiClient.put(`/${classId}/details`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get class details
export const getClassDetails = async (classId) => {
  try {
    const response = await apiClient.get(`/${classId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get class details with time slots filtered by mode
export const getClassDetailsWithMode = async (classId, mode = null, timezone = 'Asia/Kolkata') => {
  try {
    const params = {};
    if (mode) params.mode = mode;
    if (timezone) params.timezone = timezone;
    
    const response = await apiClient.get(`/${classId}`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add single time slots
export const addTimeSlots = async (classId, slotsData) => {
  try {
    const response = await apiClient.post(`/${classId}/time-slots`, slotsData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add recurring time slots
export const addRecurringTimeSlots = async (classId, recurringData) => {
  try {
    const response = await apiClient.post(`/${classId}/recurring-time-slots`, recurringData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Remove time slot
export const removeTimeSlot = async (classId, slotId) => {
  try {
    const response = await apiClient.delete(`/${classId}/time-slots/${slotId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get schedule extension info
export const getScheduleExtensionInfo = async (classId) => {
  try {
    const response = await apiClient.get(`/${classId}/schedule-extension-info`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get schedule request status
export const getScheduleRequestStatus = async (requestId) => {
  try {
    const response = await apiClient.get(`/schedule-status/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get pending wellness guide classes (Admin only)
export const getPendingWellnessGuideClasses = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/pending', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update wellness guide class approval status (Admin only)
export const updateWellnessGuideClassApproval = async (classId, isApproved, rejectionReason = '') => {
  try {
    const response = await apiClient.put(`/${classId}/approval`, { 
      isApproved,
      rejectionReason: isApproved ? '' : rejectionReason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getAllApprovedClasses,
  getMyClasses,
  getMyAddresses,
  createWellnessGuideClass,
  updateWellnessGuideClass,
  updateClassDetails,
  getClassDetails,
  addTimeSlots,
  addRecurringTimeSlots,
  removeTimeSlot,
  getScheduleExtensionInfo,
  getScheduleRequestStatus,
  getPendingWellnessGuideClasses,
  updateWellnessGuideClassApproval,
};