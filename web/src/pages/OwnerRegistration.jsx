import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerApi } from '../api/registerApi';
import '../styles/Register.css';

const StoreIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" opacity="0.9"/>
    <rect x="9" y="14" width="6" height="7" rx="1" fill="white" opacity="0.65"/>
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

export default function OwnerRegistration() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  const validate = () => {
    if (!form.name.trim())        return 'Full name is required.';
    if (!form.email.trim())       return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (!validatePassword(form.password)) {
      return 'Password must contain: uppercase (A-Z), lowercase (a-z), numbers (0-9), and special characters (!@#$%^&*)';
    }
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    if (!form.storeName.trim())   return 'Store name is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      const data = await registerApi.registerOwner({
        name:            form.name,
        email:           form.email,
        password:        form.password,
        confirmPassword: form.confirmPassword,
        storeName:       form.storeName,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'https://api.tindatrack.com/api'}/auth/oauth/google`;
  };

  return (
    <div className="reg-form-page">
      <div className="reg-form-card">

        {/* Logo */}
        <div className="reg-form-logo">
          <StoreIcon />
        </div>

        <h2>Create Your Store</h2>
        <p className="sub">Register as a store owner</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Juan Dela Cruz"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              className={error && !form.name ? 'error-input' : ''}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="storeName">Store Name</label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              placeholder="Tindahan ni Juan"
              value={form.storeName}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating store…</> : 'Create Store'}
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