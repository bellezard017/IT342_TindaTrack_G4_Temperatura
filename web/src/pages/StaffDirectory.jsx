import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { authApi } from '../api/authApi';
import { storeApi } from '../api/storeApi';
import '../styles/StaffDirectory.css';

/* ── Icons ── */
const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const TeamDirIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const AVATAR_COLORS = ['#E07A5F','#6A8CAF','#81B29A','#9B72AA','#F2A65A','#5B8DB8'];
const avatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
};

export default function StaffDirectory() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        const team = await storeApi.getTeam();
        const orderedTeam = (team || []).sort((a, b) => {
          const aOwner = a?.role?.toUpperCase() === 'OWNER';
          const bOwner = b?.role?.toUpperCase() === 'OWNER';
          if (aOwner === bOwner) return 0;
          return aOwner ? -1 : 1;
        });
        setTeamMembers(orderedTeam);
      } catch {
        setError('Unable to load team members.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const storeName = user?.storeName || 'Your Store';

  return (
    <SidebarLayout>
      <div className="sd-page">

        {/* ── Header ── */}
        <div className="sd-header">
          <button className="sd-back-btn" onClick={() => navigate('/store')}>
            <BackIcon />
          </button>
          <div>
            <h1 className="sd-title">Team Members</h1>
            <p className="sd-subtitle">All team members at {storeName}</p>
          </div>
        </div>

        {loading ? (
          <div className="sd-loading">Loading team members…</div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : (
          <div className="sd-card">

            {/* Section label */}
            <div className="sd-dir-header">
              <div className="sd-dir-icon"><TeamDirIcon /></div>
              <span className="sd-dir-label">Team Directory ({teamMembers.length})</span>
            </div>

            {/* Grid */}
            {teamMembers.length > 0 ? (
              <div className="sd-grid">
                {teamMembers.map((member, i) => {
                  const isOwner = member.role?.toUpperCase() === 'OWNER';
                  return (
                    <div className="sd-member-card" key={member.id}>
                      <div className="sd-member-avatar" style={member.avatarUrl ? undefined : { background: avatarColor(i) }}>
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={`${member?.name || 'Member'} avatar`} />
                        ) : (
                          member.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <h3 className="sd-member-name">{member.name}</h3>
                      <div className="sd-member-email">
                        <EmailIcon />
                        {member.email}
                      </div>
                      {member.createdAt && (
                        <div className="sd-member-joined">
                          Joined: {formatDate(member.createdAt)}
                        </div>
                      )}
                      <span className={`sd-member-badge ${isOwner ? 'owner' : 'staff'}`}>
                        {isOwner ? '🏪 Store Owner' : 'Staff'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sd-empty">No team members found yet.</div>
            )}

          </div>
        )}
      </div>
    </SidebarLayout>
  );
}