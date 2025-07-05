// src/api/auth.js
const BASE_URL = 'http://localhost:3000/api/users';

export async function signupUser(data) {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || 'Registration failed');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

export async function signupTrainer(formData) {
  try {
    // formData is a FormData object (for file upload)
    const res = await fetch(`${BASE_URL}/register-trainer`, {
      method: 'POST',
      body: formData,
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || 'Trainer registration failed');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}

export async function loginUser(data) {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || 'Login failed');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
}