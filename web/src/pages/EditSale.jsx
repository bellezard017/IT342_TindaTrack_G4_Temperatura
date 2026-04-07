import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function EditSale() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form, setForm]         = useState({ name: '', category: '', quantity: '', price: '' });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  /* Load existing sale */
  useEffect(() => {
    const load = async () => {
      try {
        const sale = await saleApi.getSaleById(id);
        setForm({
          name:     sale.name     || '',
          category: sale.category || '',
          quantity: String(sale.quantity ?? ''),
          price:    String(sale.price    ?? ''),
        });
      } catch {
        setError('Could not load sale details. Please go back and try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const total = form.quantity && form.price && !isNaN(form.quantity) && !isNaN(form.price)
    ? (parseFloat(form.quantity) * parseFloat(form.price)).toFixed(2)
    : null;

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.name.trim())                                          return 'Item name is required.';
    if (!form.category)                                             return 'Please select a category.';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0) return 'Enter a valid quantity.';
    if (!form.price    || isNaN(form.price)    || Number(form.price)    <= 0) return 'Enter a valid price.';
    return null;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    try {
      await saleApi.updateSale(id, {
        name:     form.name,
        category: form.category,
        quantity: Number(form.quantity),
        price:    parseFloat(form.price),
        total:    parseFloat(form.quantity) * parseFloat(form.price),
      });
      setSuccess(true);
      setTimeout(() => navigate('/sales'), 1000);
    } catch {
      setError('Failed to update sale. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => navigate('/sales');

  return (
    <SidebarLayout
      pageTitle="Edit Sale"
      subtitle="Update the transaction details"
    >
      <div className="as-card">

        {loading ? (
          <div className="sr-empty">Loading sale details…</div>
        ) : (
          <>
            {error   && <div className="error-banner"  style={{ marginBottom: 20 }}>{error}</div>}
            {success && (
              <div className="success-banner" style={{ marginBottom: 20 }}>
                ✅ Sale updated successfully!
              </div>
            )}

            <form onSubmit={handleUpdate} noValidate>
              <div className="as-grid">

                {/* Item Name — full width */}
                <div className="as-field" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="name">Item Name</label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="e.g., Coca-Cola 1.5L"
                    value={form.name} onChange={handleChange}
                  />
                </div>

                {/* Category — full width */}
                <div className="as-field" style={{ gridColumn: '1 / -1' }}>
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
                  Total Amount<br />
                  <strong>₱{total}</strong>
                </div>
              )}

              {/* Buttons — full width stacked like Figma */}
              <div className="es-actions">
                <button type="submit" className="es-btn-update" disabled={saving}>
                  {saving ? <><span className="spinner-sm" /> Updating…</> : 'Update Sale'}
                </button>
                <button type="button" className="es-btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>

            </form>
          </>
        )}
      </div>
    </SidebarLayout>
  );
}