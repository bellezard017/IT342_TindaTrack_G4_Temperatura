import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/AuthApi';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const completeOAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const error = params.get('error');
      const next = params.get('next');

      if (error) {
        setStatus('Authentication failed. Redirecting...');
        setTimeout(() => navigate('/login?error=' + encodeURIComponent(error)), 1500);
        return;
      }

      if (!token) {
        setStatus('Something went wrong. Redirecting...');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/oauth/callback');

      try {
        const user = await authApi.getMe();
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.removeItem('oauth_intent');

        const hasStore = user?.storeId && user.storeId !== 0;
        const role = user?.role?.toUpperCase();

        if (next === 'setup-store' || (!hasStore && role === 'OWNER')) {
          setStatus('Account ready! Setting up your store...');
          setTimeout(() => navigate('/setup-store'), 500);
        } else if (next === 'setup-staff' || (!hasStore && role === 'STAFF')) {
          setStatus('Account ready! Joining store...');
          setTimeout(() => navigate('/setup-staff'), 500);
        } else {
          setStatus('Login successful! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 500);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setStatus('Could not complete Google login. Redirecting...');
        setTimeout(() => navigate('/login?error=oauth_user_load_failed'), 1500);
      }
    };

    completeOAuth();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      gap: '16px',
      background: '#F4F1DE',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '4px solid #EDE8DC',
        borderTopColor: '#E07A5F',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#888', fontSize: '15px', margin: 0 }}>{status}</p>
    </div>
  );
}
