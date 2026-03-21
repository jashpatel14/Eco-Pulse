import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save } from 'lucide-react';
import BackButton from '../../components/BackButton';
import CustomSelect from '../../components/CustomSelect';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import FileUpload from '../../components/FileUpload';

const emptyComp = () => ({ id: crypto.randomUUID(), componentName: '', quantity: '', makeOrBuy: 'BUY', supplier: '', unitCost: '' });
const emptyOp   = () => ({ id: crypto.randomUUID(), operationName: '', durationMins: '', workCenter: '' });

export default function BOMForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [attachments, setAttachments] = useState([]);
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
      const { data } = await api.post('/boms', { productId, components, operations, attachments });
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
          <BackButton />
          <div className="chip" style={{ padding: '6px 16px', fontSize: '0.9rem', fontWeight: 700, borderStyle: 'dashed', borderColor: 'var(--brand)' }}>
            BOM-XXXXXX
          </div>
        </div>

        <button type="submit" form="bom-form" className="btn-plm" disabled={loading || !productId} style={{ backgroundColor: 'var(--brand)' }}>
          <Save size={16} /> {loading ? 'Saving…' : 'Save'}
        </button>
      </div>

      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form id="bom-form" onSubmit={handleSubmit} className="plm-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="field-group">
              <label className="plm-label">Finished Product <span className="req">*</span></label>
              <CustomSelect 
                value={productId} 
                onChange={val => setProductId(val)} 
                placeholder="Select Finished Product..."
                options={products.map(p => ({ value: p.id, label: p.name }))}
              />
            </div>

            <div className="field-group">
              <label className="plm-label">Reference</label>
              <input className="plm-input" placeholder="Max 8 chars" maxLength={8} readOnly value="Auto-generated" style={{ opacity: 0.7 }} />
            </div>

            <div className="field-group">
              <label className="plm-label">Batch Quantity</label>
              <input className="plm-input" type="number" step="0.01" defaultValue={1} />
            </div>

            <div className="field-group">
              <label className="plm-label">Unit of Measure</label>
              <CustomSelect 
                value="Units"
                onChange={() => {}} 
                options={[
                  { value: 'Units', label: 'Units' },
                  { value: 'kg', label: 'kg' },
                  { value: 'm', label: 'm' },
                  { value: 'L', label: 'L' }
                ]}
              />
            </div>

            <div className="field-group">
              <label className="plm-label">Initial Version</label>
              <div style={{ padding: '2px 0' }}>
                <span className="plm-version-badge" style={{ fontSize: '0.9rem', padding: '4px 12px' }}>v1.0</span>
              </div>
            </div>

            <div className="field-group">
              <label className="plm-label">Initial Status</label>
              <StatusBadge status="ACTIVE" />
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
            <FileUpload 
              label="BOM Attachments (Drawings, Specs)" 
              value={attachments} 
              onChange={setAttachments} 
            />
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
              <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '0.9rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr' }}>
                <span>Components</span>
                <span>To consume</span>
                <span>Units</span>
                <span>Supplier</span>
                <span>Unit Cost (₹)</span>
              </div>
              {components.map((c, i) => (
                <div key={c.id || crypto.randomUUID()} className="dynamic-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 32px' }}>
                  <input className="plm-input" placeholder="Product..." value={c.componentName} onChange={e => updateComp(i,'componentName',e.target.value)} />
                  <input className="plm-input" type="number" placeholder="0" value={c.quantity} onChange={e => updateComp(i,'quantity',e.target.value)} />
                  <CustomSelect 
                    value="Units"
                    onChange={() => {}} 
                    options={[
                      { value: 'Units', label: 'Units' },
                      { value: 'kg', label: 'kg' }
                    ]}
                  />
                  <input className="plm-input" placeholder="Supplier..." value={c.supplier || ''} onChange={e => updateComp(i,'supplier',e.target.value)} />
                  <input className="plm-input" type="number" step="0.01" placeholder="₹0.00" value={c.unitCost || ''} onChange={e => updateComp(i,'unitCost',e.target.value)} />
                  <button type="button" className="row-del-btn" onClick={() => removeComp(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="btn-outline btn-sm" onClick={() => setComponents(prev => [...prev, emptyComp()])} style={{ marginTop: '12px' }}>
                <Plus size={16} /> Add a product
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
                <div key={o.id || crypto.randomUUID()} className="dynamic-row" style={{ gridTemplateColumns: '2fr 1fr 2fr 32px' }}>
                  <input className="plm-input" placeholder="Operation..." value={o.operationName} onChange={e => updateOp(i,'operationName',e.target.value)} />
                  <input className="plm-input" placeholder="Work Center..." value={o.workCenter} onChange={e => updateOp(i,'workCenter',e.target.value)} />
                  <input className="plm-input" placeholder="Duration..." value={o.durationMins} onChange={e => updateOp(i,'durationMins',e.target.value)} />
                  <button type="button" className="row-del-btn" onClick={() => removeOp(i)}><Trash2 size={14} /></button>
                </div>
              ))}
              <button type="button" className="btn-outline btn-sm" onClick={() => setOperations(prev => [...prev, emptyOp()])} style={{ marginTop: '12px' }}>
                <Plus size={16} /> Add a line
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
}
