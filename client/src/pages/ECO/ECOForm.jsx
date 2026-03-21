import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

export default function ECOForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  const { user } = useAuth();

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
  const [isEdit, setIsEdit] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const ecoId = searchParams.get('id');
    if (ecoId) {
      setIsEdit(true);
      api.get(`/ecos/${ecoId}`).then(({ data }) => {
        setIsLocked(data.status !== 'DRAFT');
        setForm({
          id: data.id,
          title: data.title,
          ecoType: data.ecoType,
          productId: data.productId,
          bomId: data.bomId || '',
          changeReason: data.changeReason,
          riskLevel: data.riskLevel,
          effectiveDate: data.effectiveDate ? data.effectiveDate.split('T')[0] : '',
          versionUpdate: data.versionUpdate,
        });
      });
    }

    api.get('/products').then(({ data }) => setProducts(data.filter(p => p.status === 'ACTIVE')));
  }, [searchParams]);

  useEffect(() => {
    if (form.productId) {
      api.get('/boms', { params: { productId: form.productId } }).then(({ data }) => setBoms(data.filter(b => b.status === 'ACTIVE')));
    }
  }, [form.productId]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e, action = 'save') => {
    if (e) e.preventDefault();
    if (!form.title || !form.productId) {
      addToast('Title and Product are required.', 'error');
      return;
    }
    
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
      
      let data;
      if (isEdit) {
        const res = await api.patch(`/ecos/${form.id}`, payload);
        data = res.data;
      } else {
        const res = await api.post('/ecos', payload);
        data = res.data;
      }

      if (action === 'start') {
        await api.patch(`/ecos/${data.id}/start`);
        addToast('ECO started — fields are now locked.', 'success');
      } else {
        addToast(isEdit ? 'ECO updated!' : 'ECO created!', 'success');
      }
      
      navigate(`/ecos/${data.id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to process ECO.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{isEdit ? 'Edit ECO' : 'New ECO'}</h1>
          <p className="page-desc">{isEdit ? 'Update ECO draft details' : 'Create a new Engineering Change Order'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isLocked && (
            <>
              <button type="button" className="btn-plm" onClick={e => handleSubmit(e, 'start')} disabled={loading || !form.productId}>
                Start
              </button>
              <button type="button" className="btn-outline" onClick={e => handleSubmit(e, 'save')} disabled={loading || !form.productId}>
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 680 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: '20px', padding: '0 0 16px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
             <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #ccc' }} />
             <div style={{ padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: isLocked ? '#22c55e' : '#ed8080', color: 'white' }}>
               {isLocked ? 'Locked' : (isEdit ? 'Draft' : 'New')}
             </div>
          </div>
        </div>

        <form onSubmit={e => handleSubmit(e, 'save')} className="plm-form">
          <div className="field-group">
            <label className="plm-label">Title <span className="req">*</span></label>
            <input className="plm-input" placeholder="e.g. Design Update for Pump X1" value={form.title} onChange={e => set('title', e.target.value)} required disabled={isLocked} />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">ECO Type <span className="req">*</span></label>
              <select className="plm-select" value={form.ecoType} onChange={e => set('ecoType', e.target.value)} required disabled={isEdit || isLocked}>
                <option value="PRODUCT">Products</option>
                <option value="BOM">Bill of Materials</option>
              </select>
            </div>
            <div className="field-group">
              <label className="plm-label">Product <span className="req">*</span></label>
              <select className="plm-select" value={form.productId} onChange={e => set('productId', e.target.value)} required disabled={isEdit || isLocked}>
                <option value="">Select Product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {form.ecoType === 'BOM' && (
            <div className="field-group">
              <label className="plm-label">Bill of Materials <span className="req">*</span></label>
              <select className="plm-select" value={form.bomId} onChange={e => set('bomId', e.target.value)} required disabled={isEdit || isLocked}>
                <option value="">Select Bill of Material...</option>
                {boms.map(b => <option key={b.id} value={b.id}>{b.reference} (v{b.versionNumber})</option>)}
              </select>
            </div>
          )}

          <div className="field-group">
            <label className="plm-label">User <span className="req">*</span></label>
            <input className="plm-input" readOnly value={user?.name || 'Loading...'} />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Effective Date</label>
              <input className="plm-input" type="date" value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} disabled={isLocked} />
            </div>
            <div className="field-group" style={{ justifyContent: 'flex-end', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={form.versionUpdate} onChange={e => set('versionUpdate', e.target.checked)} disabled={isLocked} />
                <label className="plm-label" style={{ marginBottom: 0 }}>Version Update</label>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
