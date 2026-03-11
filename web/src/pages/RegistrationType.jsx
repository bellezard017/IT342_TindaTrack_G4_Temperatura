import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';

/* ── Icons ── */
const StoreIcon = ({ size = 32, color = '#E07A5F' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" opacity="0.9"/>
    <rect x="9" y="14" width="6" height="7" rx="1" fill="white" opacity="0.7"/>
  </svg>
);

const UsersIcon = ({ size = 32, color = '#E07A5F' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default function RegistrationType() {
  const navigate = useNavigate();

  return (
    <div className="reg-type-page">
      <div className="reg-type-card">

        {/* Logo */}
        <div className="reg-type-logo">
          <StoreIcon size={36} color="white" />
        </div>

        <h2>Create Your Account</h2>
        <p className="sub">Choose how you want to get started</p>

        {/* Option cards */}
        <div className="option-grid">

          {/* Owner */}
          <div className="option-card">
            <div className="option-icon-wrap">
              <StoreIcon size={28} color="#E07A5F" />
            </div>
            <h3>Create a Store</h3>
            <p>Register as a store owner and start tracking your sales</p>
            <button
              className="btn-owner"
              onClick={() => navigate('/register/owner')}
            >
              Get Started as Owner
            </button>
          </div>

          {/* Staff */}
          <div className="option-card">
            <div className="option-icon-wrap">
              <UsersIcon size={28} color="#E07A5F" />
            </div>
            <h3>Join a Store</h3>
            <p>Register as staff and help manage an existing store</p>
            <button
              className="btn-staff"
              onClick={() => navigate('/register/staff')}
            >
              Join as Staff
            </button>
          </div>

        </div>

        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}