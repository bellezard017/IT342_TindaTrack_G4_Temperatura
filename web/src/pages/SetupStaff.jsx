import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
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

export default function SetupStaff() {
  const navigate = useNavigate();
  const [storeCode, setStoreCode] = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeCode.trim()) { setError('Store code is required.'); return; }

    setLoading(true);
    try {
      await axiosInstance.post('/store/join', { storeCode: storeCode.trim().toUpperCase() });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid store code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-form-page">
      <div className="reg-form-card">

        <div className="reg-form-logo">
          <UsersIcon />
        </div>

        <h2>Join a Store</h2>
        <p className="sub">Enter the store code from your owner</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="storeCode">Store Code</label>
            <input
              id="storeCode"
              type="text"
              placeholder="Enter store code from owner"
              value={storeCode}
              onChange={(e) => { setError(''); setStoreCode(e.target.value); }}
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            />
            <p className="field-hint">Ask your store owner for the store code</p>
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Joining…</> : 'Join Store'}
          </button>
        </form>

      </div>
    </div>
  );
}