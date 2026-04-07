import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { authApi } from '../api/authApi';
import { storeApi } from '../api/storeApi';
import '../styles/StoreManagement.css';

/* ── Icons ── */
const StoreInfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/>
    <rect x="9" y="14" width="6" height="7" rx="1"/>
  </svg>
);
const TeamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* Avatar color pool */
const AVATAR_COLORS = ['#E07A5F','#6A8CAF','#81B29A','#F2CC8F','#9B72AA','#E07A5F'];
const avatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

export default function StoreManagement() {
  const [copied, setCopied]         = useState(false);
  const [user, setUser]             = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const navigate = useNavigate();
  const storeCode = user?.storeCode || '';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        const team = await storeApi.getTeam();
        setTeamMembers(team || []);
      } catch {
        setError('Unable to load store details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCopy = () => {
    if (!storeCode) return;
    navigator.clipboard.writeText(storeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const staffCount  = teamMembers.filter((m) => m.role?.toUpperCase() === 'STAFF').length;
  const totalMembers = teamMembers.length;

  return (
    <SidebarLayout pageTitle="Store Management" subtitle="Manage your store settings and staff">

      {loading ? (
        <div className="sm-loading">Loading store details…</div>
      ) : error ? (
        <div className="error-banner">{error}</div>
      ) : (
        <>
          {/* ── Store Information Card ── */}
          <div className="sm-card">
            <div className="sm-section-header">
              <div className="sm-section-icon"><StoreInfoIcon /></div>
              <h3 className="sm-section-title">Store Information</h3>
            </div>

            <div className="sm-divider" />

            {/* Store Name */}
            <div className="sm-field">
              <span className="sm-field-label">Store Name</span>
              <span className="sm-field-value">{user?.storeName || 'No store assigned yet'}</span>
            </div>

            {/* Store Code */}
            <div className="sm-field">
              <span className="sm-field-label">Store Code</span>
              <div className="sm-code-row">
                <div className="sm-code-box">
                  {storeCode || 'No code yet'}
                </div>
                <button
                  className={`sm-copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  disabled={!storeCode}
                  title="Copy code"
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
              <p className="sm-field-note">Share this code with staff members to allow them to join your store</p>
            </div>

            {/* Owner */}
            <div className="sm-owner-row">
              <div className="sm-owner-avatar" style={user?.avatarUrl ? undefined : { background: avatarColor(0) }}>
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={`${user?.name || 'Owner'} avatar`} />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '—'
                )}
              </div>
              <div className="sm-owner-meta">
                <span className="sm-field-label">Owner</span>
                <span className="sm-field-value">{user?.name || '—'}</span>
                <span className="sm-field-note">{user?.email || ''}</span>
              </div>
            </div>
            <div className="sm-field">
              <span className="sm-field-label">Contact</span>
              <span className="sm-field-value">{user?.phone || 'Not set'}</span>
              <span className="sm-field-note">{user?.address || 'Address not set'}</span>
            </div>
          </div>

          <div className="sm-card">
            <div className="sm-section-header">
              <div className="sm-section-icon"><TeamIcon /></div>
              <h3 className="sm-section-title">Staff Members</h3>
              <button className="sm-view-all-btn" onClick={() => navigate('/staff')}>View All Staff</button>
            </div>

            <div className="sm-divider" />

            <div className="sm-field">
              <span className="sm-field-label">Team Members</span>
              <span className="sm-field-value">{totalMembers}</span>
              <span className="sm-field-note">Owner + staff members are visible in the team directory.</span>
            </div>
          </div>
        </>
      )}
    </SidebarLayout>
  );
}