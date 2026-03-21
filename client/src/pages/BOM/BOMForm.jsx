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
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">New Bill of Materials</h1>
          <p className="page-desc">Link components and operations to a product</p>
        </div>
      </div>

      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit} className="plm-form">
          <div className="field-group">
            <label className="plm-label">Product <span className="req">*</span></label>
            <select className="plm-select" value={productId} onChange={e => setProductId(e.target.value)} required>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="tab-bar">
            <button type="button" className={`tab-btn ${tab === 'components' ? 'active' : ''}`} onClick={() => setTab('components')}>
              Components ({components.length})
            </button>
            <button type="button" className={`tab-btn ${tab === 'operations' ? 'active' : ''}`} onClick={() => setTab('operations')}>
              Operations ({operations.length})
            </button>
          </div>

          {tab === 'components' && (
            <>
              {components.map((c, i) => (
                <div key={i} className="dynamic-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 2fr 1.5fr 32px' }}>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Component</label>}
                    <input className="plm-input" placeholder="e.g. Steel Rod" value={c.componentName} onChange={e => updateComp(i,'componentName',e.target.value)} />
                  </div>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Qty</label>}
                    <input className="plm-input" type="number" min="0" step="0.0001" placeholder="1" value={c.quantity} onChange={e => updateComp(i,'quantity',e.target.value)} />
                  </div>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Make/Buy</label>}
                    <select className="plm-select" value={c.makeOrBuy} onChange={e => updateComp(i,'makeOrBuy',e.target.value)}>
                      <option value="BUY">Buy</option>
                      <option value="MAKE">Make</option>
                    </select>
                  </div>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Supplier</label>}
                    <input className="plm-input" placeholder="Supplier name" value={c.supplier} onChange={e => updateComp(i,'supplier',e.target.value)} />
                  </div>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Unit Cost (₹)</label>}
                    <input className="plm-input" type="number" min="0" step="0.01" placeholder="0.00" value={c.unitCost} onChange={e => updateComp(i,'unitCost',e.target.value)} />
                  </div>
                  <button type="button" className="row-del-btn" onClick={() => removeComp(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="add-row-btn" onClick={() => setComponents(prev => [...prev, emptyComp()])}>
                <Plus size={14} /> Add Component
              </button>
            </>
          )}

          {tab === 'operations' && (
            <>
              {operations.map((o, i) => (
                <div key={i} className="dynamic-row" style={{ gridTemplateColumns: '2fr 1fr 2fr 32px' }}>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Operation</label>}
                    <input className="plm-input" placeholder="e.g. Welding" value={o.operationName} onChange={e => updateOp(i,'operationName',e.target.value)} />
                  </div>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Duration (min)</label>}
                    <input className="plm-input" type="number" min="0" placeholder="30" value={o.durationMins} onChange={e => updateOp(i,'durationMins',e.target.value)} />
                  </div>
                  <div className="field-group">
                    {i === 0 && <label className="plm-label">Work Center</label>}
                    <input className="plm-input" placeholder="e.g. Assembly Line 1" value={o.workCenter} onChange={e => updateOp(i,'workCenter',e.target.value)} />
                  </div>
                  <button type="button" className="row-del-btn" onClick={() => removeOp(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="add-row-btn" onClick={() => setOperations(prev => [...prev, emptyOp()])}>
                <Plus size={14} /> Add Operation
              </button>
            </>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn-plm" disabled={loading || !productId}>
              <Save size={16} /> {loading ? 'Saving…' : 'Create BOM'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
