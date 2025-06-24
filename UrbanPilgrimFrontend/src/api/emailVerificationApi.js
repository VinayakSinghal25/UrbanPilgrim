// src/api/emailVerificationApi.js
const BASE_URL = 'http://localhost:3000/api/auth';

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
});

// Send verification OTP
export async function sendVerificationOTP(token) {
  try {
    const response = await fetch(`${BASE_URL}/send-verification-otp`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send verification OTP');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error sending verification OTP:', error);
    throw error;
  }
}

// Verify email with OTP
export async function verifyEmail(token, otp) {
  try {
    const response = await fetch(`${BASE_URL}/verify-email`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ otp }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify email');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
}

// Get email verification status
export async function getEmailVerificationStatus(token) {
  try {
    const response = await fetch(`${BASE_URL}/email-verification-status`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get verification status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting verification status:', error);
    throw error;
  }
}