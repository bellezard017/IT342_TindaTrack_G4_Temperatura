import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { authApi } from '../api/AuthApi';
import { storeApi } from '../api/storeApi';
import '../styles/storemanagement.css';

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
const ActivityIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
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
const AddSaleActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const EditActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const DeleteActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
);
const ExportActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const ProfileActivityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const AVATAR_COLORS = ['#E07A5F','#6A8CAF','#81B29A','#F2CC8F','#9B72AA'];
const avatarColor = (i) => AVATAR_COLORS[i % AVATAR_COLORS.length];

/* Placeholder activity shown while loading or if backend not ready */
const PLACEHOLDER_ACTIVITY = [];

/* Format timestamp from backend e.g. "2026-04-07T10:30:00" */
const formatActivityTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now  = new Date();
    const diffMs   = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs  = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1)   return 'Just now';
    if (diffMins < 60)  return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHrs  < 24)  return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (diffDays === 1) return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
           ` at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  } catch { return isoString; }
};

const ActivityIconMap = {
  add:     { icon: <AddSaleActivityIcon />,    bg: '#DCFCE7' },
  edit:    { icon: <EditActivityIcon />,       bg: '#DBEAFE' },
  delete:  { icon: <DeleteActivityIcon />,     bg: '#FEE2E2' },
  export:  { icon: <ExportActivityIcon />,     bg: '#FEF3C7' },
  profile: { icon: <ProfileActivityIcon />,    bg: '#EDE9FE' },
};

export default function StoreManagement() {
  const [copied, setCopied]           = useState(false);
  const [user, setUser]               = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [teamMembers, setTeamMembers] = useState([]);
  const [activity, setActivity]       = useState(PLACEHOLDER_ACTIVITY);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Export state
  const [exporting, setExporting]         = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError]     = useState('');

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
        // Load activity logs
        try {
          const logs = await storeApi.getActivity();
          console.log('[ActivityLog] Fetched logs from backend:', logs);
          if (Array.isArray(logs)) {
            if (logs.length === 0) {
              console.log('[ActivityLog] No activities recorded yet');
            } else {
              // Normalize backend shape → { id, type, label, userName, createdAt, amount }
              const normalized = logs.map((l) => ({
                id:       l.id,
                type:     l.type     || 'profile',
                label:    l.label    || l.description || '',
                user:     l.userName || l.user        || 'Unknown',
                time:     formatActivityTime(l.createdAt || l.timestamp),
                amount:   l.amount   ? `₱${Number(l.amount).toFixed(2)}` : null,
              }));
              console.log('[ActivityLog] Normalized activities:', normalized);
              setActivity(normalized);
            }
          } else {
            console.warn('[ActivityLog] Response is not an array:', logs);
          }
        } catch (logErr) {
          console.error('[ActivityLog] Error loading activities:', logErr);
          /* keep empty placeholder */
        }
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

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    setExportSuccess(false);
    try {
      // Try backend CSV endpoint first
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/sales/export`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.ok) {
        const blob = await response.blob();
        downloadBlob(blob, `sales_export.csv`);
      } else {
        // Fallback: build CSV client-side from all sales
        const { saleApi } = await import('../api/saleApi');
        const allSales = await saleApi.getSales();
        const csv  = buildCSV(allSales);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `sales_export.csv`);
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildCSV = (sales) => {
    if (!sales.length) return '"No sales data available"';

    // Group all sales by date
    const grouped = {};
    sales.forEach((s) => {
      const day = s.date || 'Unknown';
      if (!grouped[day]) grouped[day] = { transactions: 0, revenue: 0, items: {} };
      grouped[day].transactions += 1;
      grouped[day].revenue      += Number(s.total) || 0;
      const name = s.name || 'Unknown';
      if (!grouped[day].items[name]) grouped[day].items[name] = { qty: 0, total: 0 };
      grouped[day].items[name].qty   += Number(s.quantity) || 0;
      grouped[day].items[name].total += Number(s.total)    || 0;
    });

    const storeName  = user?.storeName || 'Store';
    const exportedOn = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const sortedDays = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
    const firstDay   = sortedDays[0];
    const lastDay    = sortedDays[sortedDays.length - 1];

    const lines = [];

    // ── File header ──
    lines.push(`"${storeName} - Sales Summary Report"`);
    lines.push(`"Period: ${firstDay} to ${lastDay}"`);
    lines.push(`"Exported on: ${exportedOn}"`);
    lines.push('');

    // ── One section per day ──
    sortedDays.forEach((day) => {
      const d = grouped[day];
      const itemList = Object.entries(d.items)
        .sort((a, b) => b[1].qty - a[1].qty);

      lines.push(`"DATE","${day}"`);
      lines.push(`"Total Transactions","${d.transactions}"`);
      lines.push(`"Total Revenue","₱${d.revenue.toFixed(2)}"`);
      lines.push('');
      lines.push('"Items Sold","Quantity","Amount"');
      itemList.forEach(([name, info]) => {
        lines.push(`"${name}","${info.qty}","₱${info.total.toFixed(2)}"`);
      });
      lines.push(''); // blank line between days
    });

    // ── Grand total ──
    const grand = Object.values(grouped).reduce(
      (acc, d) => {
        acc.transactions += d.transactions;
        acc.revenue      += d.revenue;
        Object.entries(d.items).forEach(([name, info]) => {
          if (!acc.items[name]) acc.items[name] = { qty: 0, total: 0 };
          acc.items[name].qty   += info.qty;
          acc.items[name].total += info.total;
        });
        return acc;
      },
      { transactions: 0, revenue: 0, items: {} }
    );

    lines.push('"--- OVERALL SUMMARY ---"');
    lines.push(`"Total Days","${sortedDays.length}"`);
    lines.push(`"Total Transactions","${grand.transactions}"`);
    lines.push(`"Total Revenue","₱${grand.revenue.toFixed(2)}"`);
    lines.push('');
    lines.push('"All Items Sold","Total Quantity","Total Amount"');
    Object.entries(grand.items)
      .sort((a, b) => b[1].qty - a[1].qty)
      .forEach(([name, info]) => {
        lines.push(`"${name}","${info.qty}","₱${info.total.toFixed(2)}"`);
      });

    return lines.join('\n');
  };

  const staffCount   = teamMembers.filter((m) => m.role?.toUpperCase() === 'STAFF').length;
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
                <div className="sm-code-box">{storeCode || 'No code yet'}</div>
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
            <div className="sm-field">
              <span className="sm-field-label">Owner</span>
              <div className="sm-owner-row">
                <div className="sm-owner-avatar" style={{ background: avatarColor(0) }}>
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="owner" />
                    : user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="sm-owner-meta">
                  <span className="sm-field-value">{user?.name || '—'}</span>
                  <span className="sm-field-note">{user?.email || ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Staff Members Card ── */}
          <div className="sm-card">
            <div className="sm-section-header">
              <div className="sm-section-icon"><TeamIcon /></div>
              <h3 className="sm-section-title">Staff Members</h3>
              <button className="sm-view-all-btn" onClick={() => navigate('/staff')}>
                View All Staff
              </button>
            </div>
            <div className="sm-divider" />
            <p className="sm-staff-count-line">
              {staffCount} staff member{staffCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ── Stats Row ── */}
          <div className="sm-stats-row">
            <div className="sm-stat-box">
              <span className="sm-stat-label">Total Staff</span>
              <span className="sm-stat-value">{staffCount}</span>
            </div>
            <div className="sm-stat-box">
              <span className="sm-stat-label">Total Members</span>
              <span className="sm-stat-value">{totalMembers}</span>
              <span className="sm-stat-note">Including owner</span>
            </div>
          </div>

          {/* ── Export Sales CSV Card ── */}
          <div className="sm-card" style={{ marginTop: 20 }}>
            <div className="sm-section-header">
              <div className="sm-section-icon"><ExportIcon /></div>
              <h3 className="sm-section-title">Export Sales Records</h3>
            </div>
            <div className="sm-divider" />

            <div className="sm-export-simple">
              <div>
                <p className="sm-export-desc">Download all your sales records as a CSV file.</p>
                {exportError   && <p className="sm-export-error">{exportError}</p>}
                {exportSuccess && <p className="sm-export-success">✅ CSV downloaded successfully!</p>}
              </div>
              <button
                className={`sm-export-btn ${exporting ? 'loading' : ''} ${exportSuccess ? 'success' : ''}`}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? (
                  <><span className="spinner-sm-dark" /> Exporting…</>
                ) : exportSuccess ? (
                  <>✓ Downloaded!</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export CSV
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Activity History Card ── */}
          <div className="sm-card" style={{ marginTop: 20 }}>
            <div className="sm-section-header">
              <div className="sm-section-icon"><ActivityIcon /></div>
              <h3 className="sm-section-title">Activity History</h3>
            </div>
            <div className="sm-divider" />

            <div className="sm-activity-list">
              {activity.length === 0 ? (
                <div className="sm-empty">No activity recorded yet.</div>
              ) : activity.map((item) => {
                const { icon, bg } = ActivityIconMap[item.type] || ActivityIconMap['profile'];
                return (
                  <div className="sm-activity-item" key={item.id}>
                    <div className="sm-activity-icon" style={{ background: bg }}>
                      {icon}
                    </div>
                    <div className="sm-activity-body">
                      <span className="sm-activity-label">{item.label}</span>
                      <span className="sm-activity-meta">
                        by {item.user} &bull; {item.time}
                      </span>
                      {item.amount && (
                        <span className="sm-activity-amount">{item.amount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </SidebarLayout>
  );
}
