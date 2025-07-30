// src/api/wellnessGuideApi.js
import { getTokenFromCookie } from '../utils/cookies';
import { BASE_URL } from '../utils/constants';

const WELLNESS_GUIDE_BASE_URL = `${BASE_URL}/wellness-guides`;
const SPECIALTY_BASE_URL = `${BASE_URL}/specialties`;

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Helper function to get auth headers for form data
const getAuthHeadersFormData = (token) => ({
  'Authorization': `Bearer ${token}`
});

// Helper function to get token from cookies or localStorage
const getToken = () => {
  // Try cookies first, then fallback to localStorage
  let token = getTokenFromCookie();
  if (!token) {
    token = localStorage.getItem('token');
  }
  return token;
};

// Check if user is eligible to become a wellness guide
export async function checkWellnessGuideEligibility(token) {
  try {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}/eligibility`, {
      method: 'GET',
      headers: getAuthHeaders(authToken),
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
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}`, {
      method: 'POST',
      headers: getAuthHeadersFormData(authToken),
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
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}/profile`, {
      method: 'GET',
      headers: getAuthHeaders(authToken),
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

// Get wellness guide by ID (Public - only approved guides)
export async function getWellnessGuideById(token, id) {
  try {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(authToken),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch wellness guide details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching wellness guide by ID:', error);
    throw error;
  }
}

// Get wellness guide by ID (Admin access - can see pending guides)
export async function getWellnessGuideByIdAdmin(token, id) {
  try {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}/admin/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(authToken),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch wellness guide details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching wellness guide by ID (admin):', error);
    throw error;
  }
}

// Get pending wellness guides (Admin only)
export async function getPendingWellnessGuides(token, page = 1, limit = 10) {
  try {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    console.log('Making request with token:', authToken ? 'Token exists' : 'No token');
    
    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}/pending?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(authToken),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch pending wellness guides');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending wellness guides:', error);
    throw error;
  }
}

// Update wellness guide approval status (Admin only)
export async function updateWellnessGuideApproval(token, guideId, isApproved) {
  try {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${WELLNESS_GUIDE_BASE_URL}/${guideId}/approval`, {
      method: 'PUT',
      headers: getAuthHeaders(authToken),
      body: JSON.stringify({ isApproved }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update approval status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating wellness guide approval:', error);
    throw error;
  }
}