import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Save } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';

export default function ECODraftProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [eco, setEco] = useState(null);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({ salePrice: '', costPrice: '', attachments: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: ecoData } = await api.get(`/ecos/${id}`);
        if (ecoData.ecoType !== 'PRODUCT') {
          addToast('Not a Product ECO.', 'error');
          return navigate('/ecos');
        }
        setEco(ecoData);
        
        const { data: prodData } = await api.get(`/products/${ecoData.productId}`);
        const currentVersion = prodData.versions.find(v => v.versionNumber === prodData.currentVersion) || prodData;
        setProduct(currentVersion);

        // Apply draft changes if any
        let sp = currentVersion.salePrice;
        let cp = currentVersion.costPrice;
        let att = currentVersion.attachments ? currentVersion.attachments.join(', ') : '';

        ecoData.draftChanges?.forEach(c => {
          if (c.fieldName === 'salePrice') sp = c.newValue;
          if (c.fieldName === 'costPrice') cp = c.newValue;
          if (c.fieldName === 'attachments') att = JSON.parse(c.newValue).join(', ');
        });

        setForm({ salePrice: sp, costPrice: cp, attachments: att });
      } catch (err) {
        addToast('Failed to load data.', 'error');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, addToast]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const changes = [];
      const newAtt = form.attachments ? form.attachments.split(',').map(s => s.trim()).filter(Boolean) : [];
      const oldAtt = product.attachments || [];

      if (parseFloat(form.salePrice) !== parseFloat(product.salePrice)) {
        changes.push({
          fieldName: 'salePrice',
          recordType: 'PRODUCT',
          recordId: product.productId || product.id,
          oldValue: product.salePrice.toString(),
          newValue: form.salePrice.toString()
        });
      }
      if (parseFloat(form.costPrice) !== parseFloat(product.costPrice)) {
        changes.push({
          fieldName: 'costPrice',
          recordType: 'PRODUCT',
          recordId: product.productId || product.id,
          oldValue: product.costPrice.toString(),
          newValue: form.costPrice.toString()
        });
      }
      if (JSON.stringify(newAtt) !== JSON.stringify(oldAtt)) {
        changes.push({
          fieldName: 'attachments',
          recordType: 'PRODUCT',
          recordId: product.productId || product.id,
          oldValue: JSON.stringify(oldAtt),
          newValue: JSON.stringify(newAtt)
        });
      }

      await api.patch(`/ecos/${id}/changes`, { changes });
      addToast('Draft changes saved successfully.', 'success');
      navigate(`/ecos/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="plm-page"><div className="spinner"></div></div>;

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton label="Back to ECO" />
          <h1 className="page-title"><Package size={22} style={{ display:'inline', marginRight: 8 }} />Edit Product Draft</h1>
          <p className="page-desc">Drafting changes for ECO: {eco?.title}</p>
        </div>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 640 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="plm-form">
          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Sale Price (₹)</label>
              <input className="plm-input" name="salePrice" type="number" step="0.01" min="0" value={form.salePrice} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label className="plm-label">Cost Price (₹)</label>
              <input className="plm-input" name="costPrice" type="number" step="0.01" min="0" value={form.costPrice} onChange={handleChange} required />
            </div>
          </div>

          <div className="field-group">
            <label className="plm-label">Attachments</label>
            <input className="plm-input" name="attachments" value={form.attachments} onChange={handleChange} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Comma-separated URLs</span>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-plm" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving…' : 'Save Draft'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
