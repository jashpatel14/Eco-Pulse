import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';

const CHANGE_REASONS = ['COST_REDUCTION','QUALITY_ISSUE','CUSTOMER_DEMAND','REGULATORY','DESIGN_UPDATE'];
const RISK_LEVELS    = ['HIGH','MEDIUM','LOW'];

export default function ECOForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    ecoType: 'PRODUCT',
    productId: searchParams.get('productId') || '',
    bomId: searchParams.get('bomId') || '',
    changeReason: 'DESIGN_UPDATE',
    riskLevel: 'LOW',
    effectiveDate: '',
    versionUpdate: true,
  });
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/products').then(({ data }) => setProducts(data.filter(p => p.status === 'ACTIVE')));
    if (form.ecoType === 'BOM') {
      api.get('/boms', { params: { productId: form.productId } }).then(({ data }) => setBoms(data.filter(b => b.status === 'ACTIVE')));
    }
  }, []);

  useEffect(() => {
    if (form.ecoType === 'BOM' && form.productId) {
      api.get('/boms', { params: { productId: form.productId } }).then(({ data }) => setBoms(data.filter(b => b.status === 'ACTIVE')));
    }
  }, [form.ecoType, form.productId]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        ecoType: form.ecoType,
        productId: form.productId,
        bomId: form.ecoType === 'BOM' ? form.bomId : undefined,
        changeReason: form.changeReason,
        riskLevel: form.riskLevel,
        effectiveDate: form.effectiveDate || undefined,
        versionUpdate: form.versionUpdate,
      };
      const { data } = await api.post('/ecos', payload);
      addToast('ECO created!', 'success');
      navigate(`/ecos/${data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create ECO.', 'error');
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
          <h1 className="page-title">New Engineering Change Order</h1>
          <p className="page-desc">Draft an ECO for a product or BOM change</p>
        </div>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 680 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="plm-form">
          <div className="field-group">
            <label className="plm-label">ECO Title <span className="req">*</span></label>
            <input className="plm-input" placeholder="Brief description of the change" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">ECO Type <span className="req">*</span></label>
              <select className="plm-select" value={form.ecoType} onChange={e => set('ecoType', e.target.value)}>
                <option value="PRODUCT">Product</option>
                <option value="BOM">Bill of Materials</option>
              </select>
            </div>
            <div className="field-group">
              <label className="plm-label">Product <span className="req">*</span></label>
              <select className="plm-select" value={form.productId} onChange={e => set('productId', e.target.value)} required>
                <option value="">Select product…</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {form.ecoType === 'BOM' && (
            <div className="field-group">
              <label className="plm-label">Bill of Materials <span className="req">*</span></label>
              <select className="plm-select" value={form.bomId} onChange={e => set('bomId', e.target.value)} required>
                <option value="">Select BOM…</option>
                {boms.map(b => <option key={b.id} value={b.id}>{b.reference} (v{b.versionNumber})</option>)}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Change Reason <span className="req">*</span></label>
              <select className="plm-select" value={form.changeReason} onChange={e => set('changeReason', e.target.value)}>
                {CHANGE_REASONS.map(r => <option key={r} value={r}>{r.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="plm-label">Risk Level <span className="req">*</span></label>
              <select className="plm-select" value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)}>
                {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Target Effective Date</label>
              <input className="plm-input" type="date" value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} />
            </div>
            <div className="field-group" style={{ justifyContent: 'flex-end', paddingBottom: 2 }}>
              <label className="plm-label">Options</label>
              <label className="checkbox-label">
                <input type="checkbox" checked={form.versionUpdate} onChange={e => set('versionUpdate', e.target.checked)} />
                Create new version on apply
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-plm" disabled={loading || !form.productId}>
              <Save size={16} /> {loading ? 'Saving…' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
