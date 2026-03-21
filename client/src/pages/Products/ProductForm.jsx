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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-outline btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleSubmit} className="btn-plm" disabled={loading} style={{ backgroundColor: 'var(--brand)' }}>
          <Save size={16} /> {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 640 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit} className="plm-form">
          <div className="field-group">
            <label className="plm-label">Product Name <span className="req">*</span></label>
            <input className="plm-input" name="name" maxLength={255} placeholder="e.g. Industrial Pump Mk3" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Sales Price <span className="req">*</span></label>
              <input className="plm-input" name="salePrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.salePrice} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label className="plm-label">Cost Price <span className="req">*</span></label>
              <input className="plm-input" name="costPrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.costPrice} onChange={handleChange} required />
            </div>
          </div>

          <div className="field-group">
            <label className="plm-label">Attachments</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="plm-input" name="attachments" placeholder="Excel, PDF, images, etc." value={form.attachments} onChange={handleChange} style={{ flex: 1 }} />
              <button type="button" style={{ 
                backgroundColor: 'var(--brand)', color: 'white', border: 'none', 
                padding: '0 16px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' 
              }}>
                Upload
              </button>
            </div>
          </div>

          <div className="field-group">
            <label className="plm-label">Version</label>
            <div style={{ 
              backgroundColor: '#1e1e1e', color: 'white', padding: '8px 12px', 
              borderRadius: '4px', fontWeight: 600, width: 'fit-content', minWidth: '40px'
            }}>
              1
            </div>
          </div>

          <div className="field-group">
            <label className="plm-label">Status</label>
            <div className="badge badge-active" style={{ width: 'fit-content' }}>Active</div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
