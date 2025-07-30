// src/api/userApi.js
import { BASE_URL } from '../utils/constants';

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Get user profile
export async function getUserProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/users/profile`, {
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
    const response = await fetch(`${BASE_URL}/users/profile`, {
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
    const response = await fetch(`${BASE_URL}/users/profile`, {
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