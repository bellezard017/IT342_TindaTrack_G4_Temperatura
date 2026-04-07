import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { saleApi } from '../api/saleApi';
import '../styles/SalesRecords.css';

const CATEGORIES = [
  'All Categories',
  'Beverages',
  'Instant Noodles',
  'Canned Goods',
  'Snacks',
  'Cigarettes',
  'Toiletries',
  'Condiments',
  'Rice & Grains',
  'Other',
];

/* Category badge colors */
const CATEGORY_COLORS = {
  'Beverages':     { bg: '#DBEAFE', color: '#2563EB' },
  'Instant Noodles':{ bg: '#FEF9C3', color: '#A16207' },
  'Canned Goods':  { bg: '#DCFCE7', color: '#16A34A' },
  'Snacks':        { bg: '#FFE4E6', color: '#E11D48' },
  'Cigarettes':    { bg: '#F3F4F6', color: '#374151' },
  'Toiletries':    { bg: '#EDE9FE', color: '#7C3AED' },
  'Condiments':    { bg: '#FDE8E3', color: '#E07A5F' },
  'Rice & Grains': { bg: '#FEF3C7', color: '#D97706' },
  'Other':         { bg: '#F1F5F9', color: '#64748B' },
};

/* Icons */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

/* Placeholder data */

export default function SalesRecords() {
  const navigate  = useNavigate();
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All Categories');
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await saleApi.getSales();
        if (data?.length) setRecords(data);
      } catch {
        setRecords([]);
        setError('Unable to load sales records. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    fetchSales();
  }, []);

  const filtered = useMemo(() => records.filter((r) => {
    const matchCat    = category === 'All Categories' || r.category === category;
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [records, search, category]);

  let salesContent;
  if (loading) {
    salesContent = <div className="sr-empty">Loading sales…</div>;
  } else if (error) {
    salesContent = <div className="error-banner">{error}</div>;
  } else if (filtered.length === 0) {
    salesContent = <div className="sr-empty">No sales records found.</div>;
  } else {
    salesContent = (
      <div className="sr-table-wrap">
        <table className="sr-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const badge = CATEGORY_COLORS[r.category] || CATEGORY_COLORS['Other'];
              return (
                <tr key={r.id}>
                  <td className="sr-date-cell">
                    <span className="sr-date">{r.date}</span>
                    <span className="sr-time">{r.time}</span>
                  </td>
                  <td className="sr-name">{r.name}</td>
                  <td>
                    <span className="sr-badge"
                      style={{ background: badge.bg, color: badge.color }}>
                      {r.category}
                    </span>
                  </td>
                  <td className="sr-num">{r.quantity}</td>
                  <td className="sr-num">₱{Number(r.price).toFixed(2)}</td>
                  <td className="sr-total">₱{Number(r.total).toFixed(2)}</td>
                  <td>
                    <div className="sr-actions">
                      <button className="sr-btn-edit"
                        onClick={() => navigate(`/edit-sale/${r.id}`)}
                        title="Edit">
                        <EditIcon />
                      </button>
                      {user?.role === 'OWNER' && (
                        <button className="sr-btn-delete"
                          onClick={() => handleDelete(r.id)}
                          title="Delete">
                          <DeleteIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!globalThis.confirm('Delete this sale record?')) return;
    try {
      await saleApi.deleteSale(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  return (
    <SidebarLayout
      pageTitle="Sales Records"
      subtitle="View and manage all transactions"
      actionLabel="Add Sale"
      actionOnClick={() => navigate('/add-sale')}
    >
      <div className="sr-card">

        <div className="sr-toolbar-header">
          <h3 className="sr-section-title">All Transactions</h3>
        </div>

        {/* Search + Filter */}
        <div className="sr-toolbar">
          <div className="sr-search-wrap">
            <SearchIcon />
            <input
              type="search"
              className="sr-search"
              placeholder="Search by item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="sr-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        {salesContent}
      </div>
    </SidebarLayout>
  );
}