// src/api/bookingApi.js
import axios from 'axios';
import { getTokenFromCookie } from '../utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Try to get token from localStorage first, then cookies
  let token = localStorage.getItem('token');
  if (!token) {
    token = getTokenFromCookie();
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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