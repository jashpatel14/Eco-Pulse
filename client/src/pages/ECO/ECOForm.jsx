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
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="button" className="btn-outline" onClick={handleSubmit} disabled={loading || !form.productId}>
            Start
          </button>
          <button type="button" className="btn-outline" onClick={handleSubmit} disabled={loading || !form.productId}>
            Save
          </button>
        </div>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 680 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Stage Bar Placeholder for New ECO */}
        <div style={{ marginBottom: '20px', padding: '0 0 16px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ccc' }} />
             <div style={{ padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#ed8080', color: 'white' }}>New</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="plm-form">
          <div className="field-group">
            <label className="plm-label">Title <span className="req">*</span></label>
            <input className="plm-input" placeholder="e.g. Testing ECOS" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">ECO Type <span className="req">*</span></label>
              <select className="plm-select" value={form.ecoType} onChange={e => set('ecoType', e.target.value)} required>
                <option value="PRODUCT">Products</option>
                <option value="BOM">Bill of Materials</option>
              </select>
            </div>
            <div className="field-group">
              <label className="plm-label">Product <span className="req">*</span></label>
              <select className="plm-select" value={form.productId} onChange={e => set('productId', e.target.value)} required>
                <option value="">Select Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {form.ecoType === 'BOM' && (
            <div className="field-group">
              <label className="plm-label">Bill of Materials <span className="req">*</span></label>
              <select className="plm-select" value={form.bomId} onChange={e => set('bomId', e.target.value)} required>
                <option value="">Select Bill of Material...</option>
                {boms.map(b => <option key={b.id} value={b.id}>{b.reference} (v{b.versionNumber})</option>)}
              </select>
            </div>
          )}

          <div className="field-group">
            <label className="plm-label">User <span className="req">*</span></label>
            <input className="plm-input" readOnly value="Admin1" />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Effective Date</label>
              <input className="plm-input" type="date" value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} />
            </div>
            <div className="field-group" style={{ justifyContent: 'flex-end', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.versionUpdate} onChange={e => set('versionUpdate', e.target.checked)} />
                <label className="plm-label" style={{ marginBottom: 0 }}>Version Update</label>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
