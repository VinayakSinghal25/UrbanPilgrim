// src/api/auth.js
const BASE_URL = 'http://localhost:3000/api/users';

export async function signupUser(data) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function signupTrainer(formData) {
  // formData is a FormData object (for file upload)
  const res = await fetch(`${BASE_URL}/register-trainer`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}