import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '../styles/Register.css';

const StoreIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" opacity="0.9"/>
    <rect x="9" y="14" width="6" height="7" rx="1" fill="white" opacity="0.65"/>
  </svg>
);

export default function SetupStore() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName.trim()) { setError('Store name is required.'); return; }

    setLoading(true);
    try {
      await axiosInstance.post('/store/setup', { storeName });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set up store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-form-page">
      <div className="reg-form-card">

        <div className="reg-form-logo">
          <StoreIcon />
        </div>

        <h2>One More Step!</h2>
        <p className="sub">What would you like to name your store?</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="storeName">Store Name</label>
            <input
              id="storeName"
              type="text"
              placeholder="Tindahan ni Juan"
              value={storeName}
              onChange={(e) => { setError(''); setStoreName(e.target.value); }}
            />
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Saving…</> : 'Continue to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}