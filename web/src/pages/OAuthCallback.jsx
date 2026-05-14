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
      const state = params.get('state');

      const routeForUser = (user, requestedNext) => {
        const hasStore = user?.storeId && user.storeId !== 0;
        const role = user?.role?.toUpperCase();

        if (!hasStore && role === 'OWNER') {
          return '/setup-store';
        }
        if (!hasStore && role === 'STAFF') {
          return '/setup-staff';
        }
        if (requestedNext && requestedNext !== 'dashboard') {
          return `/${requestedNext}`;
        }
        return '/dashboard';
      };

      const finishLogin = (user, route = '/dashboard') => {
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.removeItem('oauth_intent');
        setStatus(route === '/dashboard'
          ? 'Login successful! Redirecting to dashboard...'
          : 'Account ready! Complete your store setup...');
        setTimeout(() => navigate(route, { replace: true }), 500);
      };

      if (error) {
        const intent = state || sessionStorage.getItem('oauth_intent') || 'owner';
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);

        if (isLocalhost) {
          try {
            setStatus('Google blocked the development login. Opening local session...');
            const data = await authApi.googleDevLogin(intent);
            localStorage.setItem('token', data.token);
            finishLogin(data.user, routeForUser(data.user));
          } catch {
            setStatus('Authentication failed. Redirecting...');
            setTimeout(() => navigate('/login?error=' + encodeURIComponent(error)), 1500);
          }
        } else {
          setStatus('Authentication failed. Redirecting...');
          setTimeout(() => navigate('/login?error=' + encodeURIComponent(error)), 1500);
        }
        return;
      }

      if (!token) {
        const existingToken = localStorage.getItem('token');
        if (existingToken) {
          try {
            const user = await authApi.getMe();
            finishLogin(user, routeForUser(user, next));
          } catch {
            const intent = sessionStorage.getItem('oauth_intent');
            const setupRoute = intent === 'staff' ? '/setup-staff' : '/setup-store';
            setStatus('Account ready! Complete your store setup...');
            setTimeout(() => navigate(setupRoute, { replace: true }), 500);
          }
        } else {
          setStatus('Something went wrong. Redirecting...');
          setTimeout(() => navigate('/login'), 1500);
        }
        return;
      }

      localStorage.setItem('token', token);
      window.history.replaceState({}, '', '/oauth/callback');

      try {
        const user = await authApi.getMe();

        finishLogin(user, routeForUser(user, next));
      } catch {
        if (next === 'setup-store' || next === 'setup-staff') {
          setStatus('Account ready! Complete your store setup...');
          setTimeout(() => navigate(`/${next}`, { replace: true }), 500);
          return;
        }

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
