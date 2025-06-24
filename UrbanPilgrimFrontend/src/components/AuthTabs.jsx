import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSignupForm from './forms/UserSignupForm';
import TrainerSignupForm from './forms/TrainerSignupForm';
import LoginForm from './forms/LoginForm';

export default function AuthTabs() {
  const [tab, setTab] = useState('login');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleAuthSuccess = (result) => {
    console.log('Auth success in AuthTabs:', result);
    setSuccess(result);
    // Navigate to home page after 1 second
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };

  const getDisplayName = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || user?.lastName || user?.email || 'User';
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow">
      <div className="flex mb-4">
        <button 
          className={`flex-1 py-2 ${tab === 'login' ? 'border-b-2 border-blue-500' : ''}`} 
          onClick={() => setTab('login')}
        >
          Login
        </button>
        <button 
          className={`flex-1 py-2 ${tab === 'user' ? 'border-b-2 border-blue-500' : ''}`} 
          onClick={() => setTab('user')}
        >
          User Signup
        </button>
        <button 
          className={`flex-1 py-2 ${tab === 'trainer' ? 'border-b-2 border-blue-500' : ''}`} 
          onClick={() => setTab('trainer')}
        >
          Trainer Signup
        </button>
      </div>
      
      {success && (
        <div className="text-green-600 mb-2 p-3 bg-green-50 border border-green-200 rounded-md">
          Success! Welcome, {getDisplayName(success.user)}. Redirecting to home page...
        </div>
      )}
      
      {tab === 'login' && <LoginForm onSuccess={handleAuthSuccess} />}
      {tab === 'user' && <UserSignupForm onSuccess={handleAuthSuccess} />}
      {tab === 'trainer' && <TrainerSignupForm onSuccess={handleAuthSuccess} />}
    </div>
  );
}