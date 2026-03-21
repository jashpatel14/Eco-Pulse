import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';

const emptyComp = () => ({ componentName: '', quantity: '', makeOrBuy: 'BUY', supplier: '', unitCost: '' });
const emptyOp   = () => ({ operationName: '', durationMins: '', workCenter: '' });

export default function BOMForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [components, setComponents] = useState([emptyComp()]);
  const [operations, setOperations] = useState([emptyOp()]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('components');

  useEffect(() => {
    api.get('/products').then(({ data }) => {
      const active = data.filter(p => p.status === 'ACTIVE');
      setProducts(active);
      if (active.length > 0) setProductId(active[0].id);
    });
  }, []);

  const updateComp = (i, k, v) => setComponents(prev => prev.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  const removeComp = i => setComponents(prev => prev.filter((_, idx) => idx !== i));
  const updateOp   = (i, k, v) => setOperations(prev => prev.map((o, idx) => idx === i ? { ...o, [k]: v } : o));
  const removeOp   = i => setOperations(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const validComps = components.filter(c => c.componentName && c.quantity);
      const validOps   = operations.filter(o => o.operationName && o.durationMins && o.workCenter);
      const { data } = await api.post('/boms', { productId, components: validComps, operations: validOps });
      addToast('BOM created successfully!', 'success');
      navigate(`/boms/${data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create BOM.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ 
            border: '2px dashed var(--border-light)', 
            padding: '4px 12px', 
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}>
            BOM-XXXXXX
          </div>
        </div>

        <button onClick={handleSubmit} className="btn-plm" disabled={loading || !productId} style={{ backgroundColor: 'var(--brand)' }}>
          <Save size={16} /> {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="plm-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="field-group">
              <label className="plm-label">Finished Product <span className="req">*</span></label>
              <select className="plm-select" value={productId} onChange={e => setProductId(e.target.value)} required>
                <option value="">Select Finished Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="field-group">
              <label className="plm-label">Reference</label>
              <input className="plm-input" placeholder="Max 8 chars" maxLength={8} readOnly value="Auto-gen" />
            </div>

            <div className="field-group">
              <label className="plm-label">Quantity</label>
              <input className="plm-input" type="number" step="0.01" defaultValue={1} />
            </div>

            <div className="field-group">
              <label className="plm-label">Units</label>
              <select className="plm-select">
                <option>Units</option>
                <option>kg</option>
                <option>m</option>
                <option>L</option>
              </select>
            </div>

            <div className="field-group" style={{ gridColumn: 'span 2' }}>
              <label className="plm-label">Version</label>
              <div style={{ 
                backgroundColor: '#1e1e1e', 
                color: 'white', 
                padding: '8px 12px', 
                borderRadius: '4px',
                fontWeight: 600
              }}>
                1
              </div>
            </div>
          </div>

          <div className="tab-bar">
            <button type="button" className={`tab-btn ${tab === 'components' ? 'active' : ''}`} onClick={() => setTab('components')}>
              Components ({components.length})
            </button>
            <button type="button" className={`tab-btn ${tab === 'operations' ? 'active' : ''}`} onClick={() => setTab('operations')}>
              Work Orders ({operations.length})
            </button>
          </div>

          {tab === 'components' && (
            <>
              <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr' }}>
                <span>Components</span>
                <span>To consume</span>
                <span>Units</span>
              </div>
              {components.map((c, i) => (
                <div key={i} className="dynamic-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 32px' }}>
                  <input className="plm-input" placeholder="Product..." value={c.componentName} onChange={e => updateComp(i,'componentName',e.target.value)} />
                  <input className="plm-input" type="number" placeholder="0" value={c.quantity} onChange={e => updateComp(i,'quantity',e.target.value)} />
                  <select className="plm-select">
                    <option>Units</option>
                    <option>kg</option>
                  </select>
                  <button type="button" className="row-del-btn" onClick={() => removeComp(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="add-row-btn" onClick={() => setComponents(prev => [...prev, emptyComp()])} style={{ color: 'blue', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Add a product
              </button>
            </>
          )}

          {tab === 'operations' && (
            <>
              <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '2fr 1fr 2fr' }}>
                <span>Operations</span>
                <span>Work Center</span>
                <span>Expected Duration</span>
              </div>
              {operations.map((o, i) => (
                <div key={i} className="dynamic-row" style={{ gridTemplateColumns: '2fr 1fr 2fr 32px' }}>
                  <input className="plm-input" placeholder="Operation..." value={o.operationName} onChange={e => updateOp(i,'operationName',e.target.value)} />
                  <input className="plm-input" placeholder="Work Center..." value={o.workCenter} onChange={e => updateOp(i,'workCenter',e.target.value)} />
                  <input className="plm-input" placeholder="Duration..." value={o.durationMins} onChange={e => updateOp(i,'durationMins',e.target.value)} />
                  <button type="button" className="row-del-btn" onClick={() => removeOp(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="add-row-btn" onClick={() => setOperations(prev => [...prev, emptyOp()])} style={{ color: 'blue', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Add a line
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
