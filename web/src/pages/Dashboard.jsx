import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import axiosInstance from '../api/axiosInstance';
import '../styles/Dashboard.css';

/* ══════════════════ ICONS ══════════════════ */
const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z" opacity="0.9"/>
    <rect x="9" y="14" width="6" height="7" rx="1" fill="white" opacity="0.6"/>
  </svg>
);
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const StoreNavIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V21H3V9.5z"/>
    <rect x="9" y="14" width="6" height="7" rx="1"/>
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const ReceiptIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#E07A5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ══════════════════ PLACEHOLDER DATA ══════════════════ */
const CHART_DATA = [
  { date: 'Feb 25', revenue: 0 },
  { date: 'Feb 26', revenue: 0 },
  { date: 'Feb 27', revenue: 250 },
  { date: 'Feb 28', revenue: 1305 },
  { date: 'Mar 01', revenue: 0 },
  { date: 'Mar 02', revenue: 0 },
  { date: 'Mar 03', revenue: 0 },
];
const RECENT_SALES = [
  { id: 1, name: 'Coca-Cola 1.5L',        date: 'Feb 28, 2026 10:30 AM', amount: 325,  qty: 5  },
  { id: 2, name: 'Lucky Me Pancit Canton', date: 'Feb 28, 2026 11:15 AM', amount: 150,  qty: 10 },
  { id: 3, name: 'Marlboro Red',           date: 'Feb 28, 2026 12:00 PM', amount: 450,  qty: 3  },
  { id: 4, name: 'Century Tuna',           date: 'Feb 28, 2026 1:20 PM',  amount: 360,  qty: 8  },
  { id: 5, name: 'Alaska Condensada',      date: 'Feb 27, 2026 9:45 AM',  amount: 220,  qty: 4  },
];
const TOP_ITEMS = [
  { rank: 1, name: 'Marlboro Red',           sold: 3,  amount: 450 },
  { rank: 2, name: 'Century Tuna',           sold: 8,  amount: 360 },
  { rank: 3, name: 'Coca-Cola 1.5L',        sold: 5,  amount: 325 },
  { rank: 4, name: 'Alaska Condensada',      sold: 4,  amount: 220 },
  { rank: 5, name: 'Lucky Me Pancit Canton', sold: 10, amount: 150 },
];

/* ══════════════════ CUSTOM TOOLTIP ══════════════════ */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid #EDE8DC', borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
      }}>
        <p style={{ fontSize: 12, color: '#aaa', marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#E07A5F' }}>
          ₱{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

/* ══════════════════ NAV ITEMS ══════════════════ */
const NAV_ITEMS = [
  { key: 'dashboard',        label: 'Dashboard',        icon: <DashboardIcon />, path: '/dashboard' },
  { key: 'add-sale',         label: 'Add Sale',         icon: <PlusIcon />,      path: '/add-sale'  },
  { key: 'sales-records',    label: 'Sales Records',    icon: <CartIcon />,      path: '/sales'     },
  { key: 'store-management', label: 'Store Management', icon: <StoreNavIcon />,  path: '/store'     },
  { key: 'profile',          label: 'Profile',          icon: <UserIcon />,      path: '/profile'   },
];

/* ══════════════════ COMPONENT ══════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats]             = useState({ todaySales: 0, transactions: 0, itemsSold: 0 });
  const [recentSales, setRecentSales] = useState(RECENT_SALES);
  const [topItems, setTopItems]       = useState(TOP_ITEMS);
  const [chartData, setChartData]     = useState(CHART_DATA);
  const [activeNav, setActiveNav]     = useState('dashboard');

  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    // ── Handle OAuth redirect: ?token=xxx&user=Name ──
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    const error  = params.get('error');

    if (error) {
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      // Clean token from URL
      window.history.replaceState({}, '', '/dashboard');

      // Check if this came from a register flow
      const intent = sessionStorage.getItem('oauth_intent');
      sessionStorage.removeItem('oauth_intent');

      if (intent === 'owner') {
        navigate('/setup-store');
        return;
      }
      if (intent === 'staff') {
        navigate('/setup-staff');
        return;
      }
    }

    // ── Fetch dashboard data ──
    const fetchDashboard = async () => {
      try {
        const { data } = await axiosInstance.get('/dashboard');
        if (data?.data) {
          setStats({
            todaySales:   data.data.totalDailySales  ?? 0,
            transactions: data.data.transactionCount ?? 0,
            itemsSold:    data.data.itemsSold         ?? 0,
          });
          if (data.data.recentSales?.length) setRecentSales(data.data.recentSales);
          if (data.data.topItems?.length)    setTopItems(data.data.topItems);
          if (data.data.chartData?.length)   setChartData(data.data.chartData);
        }
      } catch {
        // keep placeholder data while backend is not connected
      }
    };
    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-page">

      {/* ══ SIDEBAR ══ */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-store-row">
            <div className="sidebar-store-icon"><StoreIcon /></div>
            <div>
              <div className="sidebar-store-name">TindaTrack</div>
              <div className="sidebar-sub-name">{user?.storeName || 'Tindahan ni Juan'}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
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

      {/* ══ MAIN CONTENT ══ */}
      <main className="dashboard-main">

        <div className="dashboard-topbar">
          <div>
            <h1>Today's Overview</h1>
            <p className="dashboard-date">{today}</p>
          </div>
          <button className="btn-record" onClick={() => navigate('/add-sale')}>
            Record New Sale <ArrowIcon />
          </button>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Today's Sales</span>
              <div className="stat-icon"><DollarIcon /></div>
            </div>
            <div className="stat-value">₱{stats.todaySales.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Transactions</span>
              <div className="stat-icon"><ReceiptIcon /></div>
            </div>
            <div className="stat-value">{stats.transactions}</div>
            <div className="stat-sub">Today's transaction count</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Items Sold</span>
              <div className="stat-icon"><BoxIcon /></div>
            </div>
            <div className="stat-value">{stats.itemsSold}</div>
            <div className="stat-sub">Total items today</div>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Revenue (Last 7 Days)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE0" vertical={false}/>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#aaa', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 12, fill: '#aaa', fontFamily: 'Plus Jakarta Sans' }} axisLine={false} tickLine={false} width={50}/>
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#E07A5F" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#E07A5F', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#E07A5F', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="table-card">
            <h3 className="table-card-title">Recent Sales</h3>
            {recentSales.map((sale) => (
              <div className="recent-sale-item" key={sale.id}>
                <div className="recent-sale-info">
                  <h4>{sale.name}</h4>
                  <span>{sale.date}</span>
                </div>
                <div className="recent-sale-right">
                  <span className="recent-sale-amount">₱{sale.amount.toLocaleString()}.00</span>
                  <span className="recent-sale-qty">Qty: {sale.qty}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="table-card">
            <h3 className="table-card-title">Top Selling Items</h3>
            {topItems.map((item) => (
              <div className="top-item" key={item.rank}>
                <div className="top-rank">{item.rank}</div>
                <div className="top-item-info">
                  <h4>{item.name}</h4>
                  <span>{item.sold} units sold</span>
                </div>
                <span className="top-item-amount">₱{item.amount.toLocaleString()}.00</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}