import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';

export default function ProductForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', salePrice: '', costPrice: '', attachments: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const attachments = form.attachments
        ? form.attachments.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const { data } = await api.post('/products', {
        name: form.name,
        salePrice: form.salePrice,
        costPrice: form.costPrice,
        attachments,
      });
      addToast('Product created successfully!', 'success');
      navigate(`/products/${data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create product.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title"><Package size={22} style={{ display:'inline', marginRight: 8 }} />New Product</h1>
          <p className="page-desc">Create a new product master record</p>
        </div>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 640 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="plm-form">
          <div className="field-group">
            <label className="plm-label">Product Name <span className="req">*</span></label>
            <input className="plm-input" name="name" placeholder="e.g. Industrial Pump Mk3" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Sale Price (₹) <span className="req">*</span></label>
              <input className="plm-input" name="salePrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.salePrice} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label className="plm-label">Cost Price (₹) <span className="req">*</span></label>
              <input className="plm-input" name="costPrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.costPrice} onChange={handleChange} required />
            </div>
          </div>

          <div className="field-group">
            <label className="plm-label">Attachments</label>
            <input className="plm-input" name="attachments" placeholder="Comma-separated URLs (e.g. spec.pdf, drawing.dwg)" value={form.attachments} onChange={handleChange} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Separate multiple attachment URLs with commas</span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-plm" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving…' : 'Create Product'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
