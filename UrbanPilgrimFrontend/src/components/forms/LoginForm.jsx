import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { loginUser } from '../../api/auth';
import { authStart, authSuccess, authFailure } from '../../slices/authSlice';

export default function LoginForm({ onSuccess }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector(state => state.auth);
  
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  
    const handleSubmit = async e => {
      e.preventDefault();
      dispatch(authStart());
      
      try {
        console.log('Attempting login with:', { email: form.email }); // Debug log
        const res = await loginUser(form);
        console.log('Login response:', res); // Debug log
        
        if (res.token && res.user) {
          dispatch(authSuccess({ user: res.user, token: res.token }));
          console.log('Login successful, navigating...'); // Debug log
          
          // Handle navigation based on context
          if (onSuccess) {
            onSuccess(res);
          } else {
            // Navigate to home page after successful login
            navigate('/', { replace: true });
          }
        } else {
          dispatch(authFailure(res.message || 'Login failed - invalid response'));
        }
      } catch (error) {
        console.error('Login error:', error); // Debug log
        dispatch(authFailure(error.message || 'Login failed - network error'));
      }
    };
  
    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
          name="email" 
          type="email" 
          placeholder="Email" 
          value={form.email} 
          onChange={handleChange} 
          required 
        />
        <input 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" 
          name="password" 
          type="password" 
          placeholder="Password" 
          value={form.password} 
          onChange={handleChange} 
          required 
        />
        {error && (
          <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}
        <button 
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors duration-200"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </form>
    );
}