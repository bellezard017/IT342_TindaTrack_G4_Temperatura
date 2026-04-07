import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userName = params.get('user');
    const error = params.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate('/login?error=' + encodeURIComponent('Google login failed: ' + error));
      return;
    }

    if (!token) {
      console.error('No token received from OAuth');
      navigate('/login?error=' + encodeURIComponent('OAuth authentication failed'));
      return;
    }

    try {
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch user info from API
      fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user));
        
        // Check if user needs to set up a store
        if (user.role === 'OWNER' && (!user.storeId || user.storeId === 0)) {
          // Redirect to store setup
          navigate('/setup-store');
        } else if (!user.storeId || user.storeId === 0) {
          // Redirect to staff setup
          navigate('/setup-staff');
        } else {
          // Redirect to dashboard
          navigate('/dashboard');
        }
      })
      .catch(err => {
        console.error('Failed to fetch user info:', err);
        // Still save basic user info and redirect
        localStorage.setItem('user', JSON.stringify({ name: userName, role: 'OWNER' }));
        navigate('/setup-store');
      });
    } catch (err) {
      console.error('OAuth callback error:', err);
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
      minHeight: '100vh'
    }}>
      <div>
        <h2>Completing Authentication...</h2>
        <p>Please wait while we complete your Google login.</p>
      </div>
    </div>
  );
}
