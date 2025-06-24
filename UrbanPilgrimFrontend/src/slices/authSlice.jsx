// src/slices/authSlice.jsx
import { createSlice } from '@reduxjs/toolkit';
import { 
  getUserFromCookie, 
  getTokenFromCookie, 
  setUserInCookie, 
  setTokenInCookie, 
  clearAuthCookies 
} from '../utils/cookies';

const getInitialAuthState = () => {
  try {
    // Try to get from cookies first, fallback to localStorage for migration
    let user = getUserFromCookie();
    let token = getTokenFromCookie();
    
    console.log('Initial auth state from cookies:', { user, token }); // Debug log
    
    // Fallback to localStorage if cookies are empty (for existing users)
    if (!user || !token) {
      const localUser = localStorage.getItem('user');
      const localToken = localStorage.getItem('token');
      
      if (localUser && localToken) {
        try {
          user = JSON.parse(localUser);
          token = localToken;
          
          console.log('Migrating from localStorage to cookies:', { user, token }); // Debug log
          
          // Migrate to cookies and clear localStorage
          setUserInCookie(user);
          setTokenInCookie(token);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        } catch (error) {
          console.error('Error migrating from localStorage:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    }
    
    return {
      user: user || null,
      token: token || null,
      loading: false,
      error: null,
    };
  } catch (error) {
    console.error('Error initializing auth state:', error);
    return {
      user: null,
      token: null,
      loading: false,
      error: null,
    };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    authStart(state) {
      state.loading = true;
      state.error = null;
    },
    authSuccess(state, action) {
      console.log('Auth success payload:', action.payload); // Debug log
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      try {
        // Save to cookies
        setUserInCookie(action.payload.user);
        setTokenInCookie(action.payload.token);
        console.log('Successfully saved auth data to cookies'); // Debug log
      } catch (error) {
        console.error('Error saving to cookies:', error);
      }
    },
    authFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.user = null;
      state.token = null;
      // Clear cookies on auth failure
      clearAuthCookies();
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      // Clear cookies
      clearAuthCookies();
      console.log('Logged out and cleared cookies'); // Debug log
    },
    // Add setAuth as an alias for authSuccess for consistency
    setAuth(state, action) {
      console.log('SetAuth called with payload:', action.payload); // Debug log
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      try {
        // Save to cookies
        setUserInCookie(action.payload.user);
        setTokenInCookie(action.payload.token);
        console.log('Successfully saved auth data to cookies via setAuth'); // Debug log
      } catch (error) {
        console.error('Error saving to cookies:', error);
      }
    },
    // Update user profile in Redux state
    updateUserStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateUserSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.error = null;
      // Update cookies
      try {
        setUserInCookie(action.payload.user);
      } catch (error) {
        console.error('Error updating user in cookies:', error);
      }
    },
    updateUserFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { 
  authStart, 
  authSuccess, 
  authFailure, 
  logout,
  setAuth, // Added this export
  updateUserStart,
  updateUserSuccess,
  updateUserFailure
} = authSlice.actions;

export default authSlice.reducer;