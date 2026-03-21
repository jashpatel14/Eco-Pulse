import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import StatusBadge from '../../components/StatusBadge';
import FileUpload from '../../components/FileUpload';

export default function ProductForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', salePrice: '', costPrice: '', attachments: [] });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const setAttachments = (urls) => setForm(prev => ({ ...prev, attachments: urls }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/products', {
        name: form.name,
        salePrice: form.salePrice,
        costPrice: form.costPrice,
        attachments: form.attachments,
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
          <BackButton />
        <button type="submit" form="product-form" className="btn-plm" disabled={loading} style={{ backgroundColor: 'var(--brand)' }}>
          <Save size={16} /> {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 640 }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <form id="product-form" onSubmit={handleSubmit} className="plm-form">
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
            <FileUpload 
              label="Attachments" 
              value={form.attachments} 
              onChange={setAttachments} 
            />
          </div>

          <div className="form-row" style={{ marginTop: '8px' }}>
            <div className="field-group">
              <label className="plm-label">Initial Version</label>
              <div>
                <span className="plm-version-badge" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>v1</span>
              </div>
            </div>

            <div className="field-group">
              <label className="plm-label">Initial Status</label>
              <StatusBadge status="ACTIVE" />
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
