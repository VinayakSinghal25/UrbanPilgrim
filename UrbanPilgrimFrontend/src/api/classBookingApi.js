// UrbanPilgrimFrontend/src/api/classBookingApi.js
import axios from 'axios';
import { getTokenFromCookie } from '../utils/cookies';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token
api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  if (!token) token = getTokenFromCookie();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const classBookingApi = {
  // Review (no auth required)
  getBookingReview: async (classId, slotIds, attendeeCount) => {
    try {
      const params = {
        classId,
        slotIds: Array.isArray(slotIds) ? JSON.stringify(slotIds) : slotIds,
        attendeeCount,
      };
      const res = await api.get('/bookings/class/review', { params });
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create booking (auth)
  createBooking: async (payload) => {
    try {
      const res = await api.post('/bookings/class/create', payload);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  handlePaymentCallback: async (paymentData) => {
    try {
      const res = await api.post('/bookings/class/payment-callback', paymentData);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  handlePaymentFailure: async (failureData) => {
    try {
      const res = await api.post('/bookings/class/payment-failed', failureData);
      return res.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default classBookingApi; 