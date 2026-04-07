import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/registerApi';
import PasswordField from '../components/PasswordField';
import '../styles/Register.css';

const UsersIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

export default function StaffRegistration() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeCode: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password)
    );
  };

  const validate = () => {
    if (!form.name.trim())                        return 'Full name is required.';
    if (!form.email.trim())                       return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email))         return 'Enter a valid email address.';
    if (form.password.length < 8)                 return 'Password must be at least 8 characters.';
    if (!validatePassword(form.password))         return 'Password must contain: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special characters (!@#$%^&*)';
    if (form.password !== form.confirmPassword)   return 'Passwords do not match.';
    if (!form.storeCode.trim())                   return 'Store code is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const data = await registerApi.registerStaff({
        name:            form.name,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirmPassword,
        storeCode:       form.storeCode.trim().toUpperCase(),
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please check your store code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Save intent so Dashboard knows to redirect to setup-staff after OAuth
  const handleGoogleSignup = () => {
    sessionStorage.setItem('oauth_intent', 'staff');
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/auth/oauth/google/login`;
  };

  return (
    <div className="reg-form-page">
      <div className="reg-form-card">

        <div className="reg-form-logo">
          <UsersIcon />
        </div>

        <h2>Join a Store</h2>
        <p className="sub">Register as staff member</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name" name="name" type="text"
              placeholder="Maria Santos" autoComplete="name"
              value={form.name} onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              placeholder="your@email.com" autoComplete="email"
              value={form.email} onChange={handleChange}
            />
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            error={!!error}
          />

          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={!!error}
          />

          <div className="field">
            <label htmlFor="storeCode">Store Code</label>
            <input
              id="storeCode" name="storeCode" type="text"
              placeholder="Enter store code from owner"
              value={form.storeCode} onChange={handleChange}
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <p className="field-hint">Ask your store owner for the store code</p>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Joining store…</> : 'Join Store'}
          </button>
        </form>

        <div className="divider">Or</div>

        <button className="btn-google" onClick={handleGoogleSignup} type="button">
          <GoogleIcon />
          Sign up with Google
        </button>

        <Link to="/register" className="back-link">
          ← Back to registration options
        </Link>

      </div>
    </div>
  );
}