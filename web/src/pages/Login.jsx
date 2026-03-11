import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/authApi';
import '../styles/Login.css';

/* ── SVG Icons ── */
const HomeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" fill="white" opacity="0.95"/>
    <rect x="9" y="14" width="6" height="7" rx="1" fill="white" opacity="0.55"/>
  </svg>
);

const TrendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FEATURES = [
  {
    icon: <TrendIcon />,
    title: 'Sales Analytics',
    desc: 'Track daily sales and view detailed analytics with interactive charts',
  },
  {
    icon: <UsersIcon />,
    title: 'Team Management',
    desc: 'Add staff members and manage permissions with role-based access',
  },
  {
    icon: <ShieldIcon />,
    title: 'Secure & Reliable',
    desc: 'Your data is safe with secure authentication and cloud backup',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login({ email: form.email, password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Matches backend: GET /api/auth/oauth/google/login
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/oauth/google/login`;
  };

  return (
    <div className="login-page">

      {/* ══ LEFT PANEL ══ */}
      <div className="login-left">

        {/* Logo */}
        <div className="logo-row">
          <div className="logo-icon">
            <HomeIcon />
          </div>
          <span className="logo-name">TindaTrack</span>
        </div>

        {/* Hero + Features — centered vertically */}
        <div className="hero-text">
          <h1>
            Manage Your<br />
            Sari-Sari Store<br />
            With Ease
          </h1>

          <div className="feature-list">
            {FEATURES.map((f) => (
              <div className="feature-item" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="login-right">
        <div className="login-card">

          <h2>Welcome Back</h2>
          <p className="sub">Sign in to your TindaTrack account</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleLogin} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email" name="email" type="email"
                placeholder="your@email.com" autoComplete="email"
                value={form.email} onChange={handleChange}
                className={error ? 'error-input' : ''}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                placeholder="••••••••" autoComplete="current-password"
                value={form.password} onChange={handleChange}
                className={error ? 'error-input' : ''}
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Login'}
            </button>
          </form>

          <div className="divider">Or</div>

          <button className="btn-google" onClick={handleGoogleLogin} type="button">
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>

        </div>
      </div>

    </div>
  );
}