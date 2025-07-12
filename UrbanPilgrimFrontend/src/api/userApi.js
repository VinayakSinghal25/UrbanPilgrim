// src/api/userApi.js
const BASE_URL = 'http://localhost:3000/api/users';

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Get user profile
export async function getUserProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(token, userData) {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Update user password
export async function updateUserPassword(token, passwordData) {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(passwordData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update password');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

// Get user bookings
export async function getUserBookings(token, page = 1, limit = 10, status = null, bookingType = null) {
  try {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (bookingType) params.append('bookingType', bookingType);
    
    const response = await fetch(`${BASE_URL}/my-bookings?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bookings');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
}

// Get booking details
export async function getBookingDetails(token, bookingId) {
  try {
    const response = await fetch(`${BASE_URL}/booking/${bookingId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch booking details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching booking details:', error);
    throw error;
  }
}