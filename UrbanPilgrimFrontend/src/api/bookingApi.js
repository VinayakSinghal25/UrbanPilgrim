// src/api/bookingApi.js
import axios from 'axios';
import { getTokenFromCookie, clearAuthCookies } from '../utils/cookies';
import { BASE_URL } from '../utils/constants';

const API_BASE_URL = BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Try to get token from cookies first, then localStorage as fallback
  let token = getTokenFromCookie();
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  console.log('Token for request:', token ? 'Present' : 'Missing'); // Debug log
  console.log('Token value:', token ? token.substring(0, 20) + '...' : 'None'); // Debug log
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error('No token found for authenticated request');
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Token expired or invalid, redirecting to login');
      // Clear auth data
      clearAuthCookies();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const bookingApi = {
  // Get booking review (no auth required)
  getBookingReview: async (experienceId, occupancy, sessionCount, selectedDates) => {
    try {
      const response = await api.get('/bookings/pilgrim/review', {
        params: {
          experienceId,
          occupancy,
          sessionCount,
          selectedDates: JSON.stringify(selectedDates)
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create booking (auth required)
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings/pilgrim/create', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's booking history (auth required)
  getUserBookings: async (page = 1, limit = 10, status = null) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      
      const response = await api.get('/bookings/pilgrim/user/history', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get booking details (auth required)
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/pilgrim/${bookingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Payment callback endpoints
  handlePaymentCallback: async (paymentData) => {
    try {
      const response = await api.post('/bookings/pilgrim/payment-callback', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  handlePaymentFailure: async (failureData) => {
    try {
      const response = await api.post('/bookings/pilgrim/payment-failed', failureData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};