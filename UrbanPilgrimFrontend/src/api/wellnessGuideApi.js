// src/api/wellnessGuideApi.js
const BASE_URL = 'http://localhost:3000/api/wellness-guides';
const SPECIALTY_BASE_URL = 'http://localhost:3000/api/specialties';

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Helper function to get auth headers for form data
const getAuthHeadersFormData = (token) => ({
  'Authorization': `Bearer ${token}`
});

// Check if user is eligible to become a wellness guide
export async function checkWellnessGuideEligibility(token) {
  try {
    const response = await fetch(`${BASE_URL}/eligibility`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to check eligibility');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking wellness guide eligibility:', error);
    throw error;
  }
}

// Get all specialties
export async function getAllSpecialties() {
  try {
    const response = await fetch(`${SPECIALTY_BASE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch specialties');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw error;
  }
}

// Create wellness guide profile
export async function createWellnessGuide(token, formData) {
  try {
    const response = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeadersFormData(token),
      body: formData, // FormData object with files
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create wellness guide profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating wellness guide profile:', error);
    throw error;
  }
}

// Get wellness guide profile
export async function getWellnessGuideProfile(token) {
  try {
    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch wellness guide profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching wellness guide profile:', error);
    throw error;
  }
}