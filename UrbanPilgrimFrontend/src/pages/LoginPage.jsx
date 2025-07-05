import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import LoginForm from "../components/forms/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token } = useSelector(state => state.auth);

  // Get the redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  // Redirect if already logged in
  useEffect(() => {
    if (user && token) {
      console.log('Already logged in, redirecting');
      const targetUrl = redirectUrl ? decodeURIComponent(redirectUrl) : '/';
      navigate(targetUrl, { replace: true });
    }
  }, [user, token, navigate, redirectUrl]);

  const handleLoginSuccess = () => {
    console.log('Login successful, redirecting');
    const targetUrl = redirectUrl ? decodeURIComponent(redirectUrl) : '/';
    navigate(targetUrl, { replace: true });
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Login</h2>
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
}