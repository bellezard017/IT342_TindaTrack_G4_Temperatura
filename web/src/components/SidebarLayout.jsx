import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import '../styles/dashboard.css';

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" opacity="0.9" />
    <rect x="9" y="14" width="6" height="7" rx="1" fill="white" opacity="0.6" />
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const StoreNavIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" />
    <rect x="9" y="14" width="6" height="7" rx="1" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { key: 'add-sale', label: 'Add Sale', icon: <PlusIcon />, path: '/add-sale' },
  { key: 'sales-records', label: 'Sales Records', icon: <CartIcon />, path: '/sales' },
  { key: 'store-management', label: 'Store Management', icon: <StoreNavIcon />, path: '/store' },
  { key: 'profile', label: 'Profile', icon: <UserIcon />, path: '/profile' },
];

export default function SidebarLayout({ children, pageTitle, subtitle, actionLabel, actionOnClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const activePath = location.pathname;

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const freshUser = await authApi.getMe();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch {
        // keep the existing cached profile if refresh fails
      }
    };
    refreshUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-store-row">
            <div className="sidebar-store-icon">
              <StoreIcon />
            </div>
            <div>
              <div className="sidebar-store-name">TindaTrack</div>
              <div className="sidebar-sub-name">{user?.storeName || 'Tindahan ni Juan'}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter(item => item.key !== 'store-management' || user?.role === 'OWNER').map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`nav-item ${activePath === item.path ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <LogOutIcon />
            Log Out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>{pageTitle}</h1>
            {subtitle && <p className="dashboard-date">{subtitle}</p>}
          </div>
          {actionLabel && actionOnClick && (
            <button className="btn-record" onClick={actionOnClick}>
              {actionLabel}
            </button>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
