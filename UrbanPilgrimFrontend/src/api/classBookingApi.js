import axios from 'axios';
import { getTokenFromCookie } from '../utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://urbanpilgrim.onrender.com/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookie();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('auth');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const classBookingApi = {
  // Get booking review data
  getBookingReview: async (classId, slotIds, attendeeCount) => {
    try {
      const response = await api.get('/bookings/class/review', {
        params: {
          classId,
          slotIds: Array.isArray(slotIds) ? slotIds.join(',') : slotIds,
          attendeeCount,
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get booking review');
    }
  },

  // Create booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings/class/create', bookingData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
  },

  // Get booking status - use the general user booking endpoint
  getBookingStatus: async (bookingId) => {
    try {
      const response = await api.get(`/users/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get booking status');
    }
  },

  // Cancel booking - use the general booking endpoint
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
  },

  // Get user bookings - use the general user bookings endpoint
  getUserBookings: async (filters = {}) => {
    try {
      const response = await api.get('/users/my-bookings', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get user bookings');
    }
  },

  // Handle payment callback
  handlePaymentCallback: async (paymentData) => {
    try {
      const response = await api.post('/bookings/class/payment-callback', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to handle payment callback');
    }
  },

  // Handle payment failure
  handlePaymentFailure: async (failureData) => {
    try {
      const response = await api.post('/bookings/class/payment-failed', failureData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to handle payment failure');
    }
  },
}; 