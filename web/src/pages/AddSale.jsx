import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/SidebarLayout';
import { saleApi } from '../api/saleApi';
import '../styles/SalesRecords.css';

const CATEGORIES = [
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

export default function AddSale() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', category: '', quantity: '', price: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const total = form.quantity && form.price
    ? (parseFloat(form.quantity) * parseFloat(form.price)).toFixed(2)
    : null;

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim())          return 'Item name is required.';
    if (!form.category)             return 'Please select a category.';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
                                    return 'Enter a valid quantity.';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
                                    return 'Enter a valid price.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await saleApi.addSale({
        name:     form.name,
        category: form.category,
        quantity: Number(form.quantity),
        price:    parseFloat(form.price),
        total:    parseFloat(form.quantity) * parseFloat(form.price),
      });
      navigate('/sales');
    } catch {
      setError('Failed to save sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout
      pageTitle="Add New Sale"
      subtitle="Record a new transaction for your store"
    >
      <div className="as-card">
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="as-grid">

            {/* Item Name */}
            <div className="as-field">
              <label htmlFor="name">Item Name</label>
              <input
                id="name" name="name" type="text"
                placeholder="e.g., Coca-Cola 1.5L"
                value={form.name} onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div className="as-field">
              <label htmlFor="category">Category</label>
              <select
                id="category" name="category"
                value={form.category} onChange={handleChange}
                className={!form.category ? 'placeholder' : ''}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Quantity */}
            <div className="as-field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity" name="quantity" type="number"
                placeholder="e.g., 5"
                min="1" value={form.quantity} onChange={handleChange}
              />
            </div>

            {/* Price */}
            <div className="as-field">
              <label htmlFor="price">Price per Unit (₱)</label>
              <input
                id="price" name="price" type="number"
                placeholder="e.g., 65.00"
                min="0" step="0.01" value={form.price} onChange={handleChange}
              />
            </div>

          </div>

          {/* Total preview */}
          {total && (
            <div className="as-total-preview">
              Total: <strong>₱{total}</strong>
            </div>
          )}

          <div className="as-actions">
            <button type="submit" className="as-btn-save" disabled={loading}>
              {loading ? <><span className="spinner-sm" /> Saving…</> : 'Save Sale'}
            </button>
            <button type="button" className="as-btn-cancel"
              onClick={() => navigate('/sales')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
}