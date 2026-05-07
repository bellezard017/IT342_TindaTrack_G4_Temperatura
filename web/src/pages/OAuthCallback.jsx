import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userName = params.get('user');
    const error = params.get('error');

    if (error) {
      console.error('[OAuth] Error:', error);
      const errorMsg = error === 'auth_failed' 
        ? 'Google authentication failed on the backend. Please check the backend logs.' 
        : 'Google authentication failed: ' + error;
      navigate('/login?error=' + encodeURIComponent(errorMsg));
      return;
    }

    if (!token) {
      console.error('[OAuth] No token received');
      navigate('/login?error=' + encodeURIComponent('OAuth authentication failed'));
      return;
    }

    try {
      // Store token in localStorage
      localStorage.setItem('token', token);
      console.log('[OAuth] Token stored, fetching user info...');
      
      // Fetch user info from API using the token
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(user => {
        console.log('[OAuth] User info fetched:', user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on user setup status
        if (!user.storeId || user.storeId === 0) {
          // User needs to set up a store
          if (user.role === 'OWNER') {
            console.log('[OAuth] Redirecting OWNER to /setup-store');
            navigate('/setup-store');
          } else {
            console.log('[OAuth] Redirecting STAFF to /setup-staff');
            navigate('/setup-staff');
          }
        } else {
          // User has a store, go to dashboard
          console.log('[OAuth] Redirecting to /dashboard');
          navigate('/dashboard');
        }
      })
      .catch(err => {
        console.error('[OAuth] Error fetching user info:', err);
        // If we can't fetch user info, still try to navigate based on token
        navigate('/dashboard');
      });
    } catch (err) {
      console.error('[OAuth] Callback error:', err);
      navigate('/login?error=' + encodeURIComponent('Authentication error'));
    }
  }, [navigate]);

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'Plus Jakarta Sans, sans-serif'
    }}>
      <div>
        <h2>Completing Authentication...</h2>
        <p>Please wait while we complete your Google authentication.</p>
      </div>
    </div>
  );
}
