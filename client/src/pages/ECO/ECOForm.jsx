import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton';
import CustomSelect from '../../components/CustomSelect';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';
import FileUpload from '../../components/FileUpload';

export default function ECOForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [form, setForm] = useState({
    title: '',
    ecoType: searchParams.get('ecoType') || 'PRODUCT',
    productId: searchParams.get('productId') || '',
    bomId: searchParams.get('bomId') || '',
    effectiveDate: '',
    changeReason: 'DESIGN_UPDATE',
    riskLevel: 'LOW',
    priority: 'MEDIUM',
    versionUpdate: true,
    attachments: [],
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setAttachments = (urls) => set('attachments', urls);
  const [isEdit, setIsEdit] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [submitAction, setSubmitAction] = useState('save');

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
          priority: data.priority || 'MEDIUM',
          effectiveDate: data.effectiveDate ? data.effectiveDate.split('T')[0] : '',
          versionUpdate: data.versionUpdate,
          attachments: data.attachments || [],
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = submitAction;
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
        bomId: form.bomId || null,
        changeReason: form.changeReason,
        riskLevel: form.riskLevel,
        priority: form.priority,
        effectiveDate: form.effectiveDate,
        versionUpdate: form.versionUpdate,
        attachments: form.attachments,
      };
      
      let data;
      if (isEdit) {
        const res = await api.patch(`/ecos/${form.id}`, payload);
        data = res.data;
      } else {
        const res = await api.post('/ecos', payload);
        data = res.data;
        setIsEdit(true);
        set('id', data.id);
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
          <BackButton />
          <h1 className="page-title">{isEdit ? 'Edit ECO' : 'New ECO'}</h1>
          <p className="page-desc">{isEdit ? 'Update ECO draft details' : 'Create a new Engineering Change Order'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isLocked && (
            <>
              <button type="submit" form="eco-form" className="btn-plm" onClick={() => setSubmitAction('start')} disabled={loading || !form.productId}>
                Start
              </button>
              <button type="submit" form="eco-form" className="btn-outline" onClick={() => setSubmitAction('save')} disabled={loading || !form.productId}>
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <motion.div className="glass-card" style={{ maxWidth: 680 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Removed internal New/Draft status badge as requested */}

        <form id="eco-form" onSubmit={handleSubmit} className="plm-form">
          <div className="field-group">
            <label className="plm-label">Title <span className="req">*</span></label>
            <input className="plm-input" placeholder="e.g. Design Update for Pump X1" value={form.title} onChange={e => set('title', e.target.value)} required disabled={isLocked} />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">ECO Type <span className="req">*</span></label>
              <CustomSelect 
                value={form.ecoType} 
                onChange={val => set('ecoType', val)} 
                disabled={isEdit || isLocked}
                options={[
                  { value: "PRODUCT", label: "Products" },
                  { value: "BOM", label: "Bill of Materials" }
                ]}
              />
            </div>
            <div className="field-group">
              <label className="plm-label">Product <span className="req">*</span></label>
              <CustomSelect 
                value={form.productId} 
                onChange={val => set('productId', val)} 
                disabled={isEdit || isLocked}
                placeholder="Select Product..."
                options={products.map(p => ({ value: p.id, label: p.name }))}
              />
            </div>
          </div>

          {form.ecoType === 'BOM' && (
            <div className="field-group">
              <label className="plm-label">Bill of Materials <span className="req">*</span></label>
              <CustomSelect 
                value={form.bomId} 
                onChange={val => set('bomId', val)} 
                disabled={isEdit || isLocked}
                placeholder="Select Bill of Material..."
                options={boms.map(b => ({ value: b.id, label: `${b.reference} (v${b.versionNumber})` }))}
              />
            </div>
          )}

          <div className="field-group">
            <label className="plm-label">Initiator</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--brand-soft)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)' }}>
              <div className="sidebar-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                {user?.name?.[0] || '?'}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--brand-deep)', fontSize: '0.875rem' }}>{user?.name}</span>
            </div>
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Priority <span className="req">*</span></label>
              <CustomSelect 
                value={form.priority} 
                onChange={val => set('priority', val)} 
                disabled={isLocked}
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                  { value: "CRITICAL", label: "Critical" }
                ]}
              />
            </div>
            <div className="field-group">
              <label className="plm-label">Effective Date</label>
              <input className="plm-input" type="date" value={form.effectiveDate} onChange={e => set('effectiveDate', e.target.value)} disabled={isLocked} />
            </div>
          </div>

          <div className="field-group" style={{ marginBottom: '24px' }}>
            <label className="checkbox-label" style={{ 
              background: form.versionUpdate ? 'var(--brand-soft)' : 'var(--bg-input)',
              padding: '8px 16px',
              borderRadius: '99px',
              border: '1.5px solid',
              borderColor: form.versionUpdate ? 'var(--brand)' : 'var(--border-light)',
              transition: 'all var(--ts)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              width: 'fit-content'
            }}>
              <input type="checkbox" checked={form.versionUpdate} onChange={e => set('versionUpdate', e.target.checked)} disabled={isLocked} />
              <span style={{ fontWeight: 600, color: form.versionUpdate ? 'var(--brand-deep)' : 'var(--text-muted)' }}>Auto-update Product Version</span>
            </label>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '24px' }}>
            <FileUpload 
              label="ECO Attachments (Docs, Photos)" 
              value={form.attachments} 
              onChange={setAttachments} 
            />
          </div>
        </form>
      </motion.div>
    </div>
  );
}
