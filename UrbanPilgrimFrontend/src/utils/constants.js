// src/utils/constants.js
export const BASE_URL = 'https://urbanpilgrim.onrender.com/api';

export const PRICE_RANGES = [
  { value: 'under-25000', label: 'Under ₹25,000' },
  { value: '25000-50000', label: '₹25,000 - ₹50,000' },
  { value: '50000-100000', label: '₹50,000 - ₹100,000' },
  { value: 'above-100000', label: 'Above ₹100,000' }
];

export const ROUTES = {
  HOME: '/',
  EXPERIENCES: '/experiences',
  EXPERIENCE_DETAIL: '/experiences/:id',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  ADMIN_DASHBOARD: '/admin/dashboard'
};

export const API_ENDPOINTS = {
  PILGRIM_EXPERIENCES: '/pilgrim-experiences'
};