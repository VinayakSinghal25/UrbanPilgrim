// src/utils/cookies.js

// Set a cookie with optional expiry days (default 7 days)
export const setCookie = (name, value, days = 7) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  
  // Only use Secure flag if on HTTPS (not on localhost)
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax" + secureFlag;
};

// Get a cookie value by name
export const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Delete a cookie by name
export const deleteCookie = (name) => {
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax" + secureFlag;
};

// Get user data from cookie (parse JSON)
export const getUserFromCookie = () => {
  const userStr = getCookie('urbanpilgrim_user');
  if (userStr) {
    try {
      return JSON.parse(decodeURIComponent(userStr));
    } catch (error) {
      console.error('Error parsing user data from cookie:', error);
      deleteCookie('urbanpilgrim_user');
      return null;
    }
  }
  return null;
};

// Set user data in cookie (stringify JSON)
export const setUserInCookie = (user) => {
  setCookie('urbanpilgrim_user', encodeURIComponent(JSON.stringify(user)));
};

// Get token from cookie
export const getTokenFromCookie = () => {
  return getCookie('urbanpilgrim_token');
};

// Set token in cookie
export const setTokenInCookie = (token) => {
  setCookie('urbanpilgrim_token', token);
};

// Clear all auth cookies
export const clearAuthCookies = () => {
  deleteCookie('urbanpilgrim_user');
  deleteCookie('urbanpilgrim_token');
};