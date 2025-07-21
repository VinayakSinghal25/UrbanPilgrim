import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginForm from '../components/forms/LoginForm';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);

  // Redirect if already logged in
  useEffect(() => {
    if (user && token) {
      console.log('Already logged in, redirecting to home');
      navigate('/', { replace: true });
    }
  }, [user, token, navigate]);

  const handleLoginSuccess = () => {
    console.log('Login successful, redirecting to home');
    navigate('/', { replace: true });
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Login</h2>
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}