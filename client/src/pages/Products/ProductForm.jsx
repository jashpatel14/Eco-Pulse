import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Save, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import StatusBadge from '../../components/StatusBadge';
import FileUpload from '../../components/FileUpload';
import AnimatedButton from '../../components/AnimatedButton';
import SuccessCheckmark from '../../components/SuccessCheckmark';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', salePrice: '', costPrice: '', attachments: [] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [status, setStatus] = useState('idle'); // idle, success, error

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(({ data }) => {
          setForm({
            name: data.name,
            salePrice: data.salePrice,
            costPrice: data.costPrice,
            attachments: data.attachments || [],
          });
        })
        .catch(() => addToast('Failed to load product for editing.', 'error'))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = e => {
    if (status === 'error') setStatus('idle');
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const setAttachments = (urls) => setForm(prev => ({ ...prev, attachments: urls }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      let finalId = id;
      if (isEdit) {
        await api.put(`/products/${id}`, form);
        addToast('Product updated successfully!', 'success');
      } else {
        const { data } = await api.post('/products', form);
        finalId = data.id;
        addToast('Product created successfully!', 'success');
      }
      
      setStatus('success');
      setTimeout(() => {
        navigate(`/products/${finalId}`);
      }, 1500);

    } catch (err) {
      setStatus('error');
      addToast(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} product.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="plm-page"><div className="spinner"></div></div>;

  return (
    <div className="plm-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BackButton />
            <h1 className="page-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          </div>
        <AnimatedButton 
          type="submit" 
          form="product-form" 
          loading={loading}
          disabled={status === 'success'}
          style={{ gap: 8 }}
        >
          {isEdit ? 'Update Product' : 'Save Product'}
        </AnimatedButton>
      </div>

      <div style={{ position: 'relative', maxWidth: 640 }}>
        <AnimatePresence>
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <SuccessCheckmark />
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ marginTop: 16, color: 'var(--brand)' }}
              >
                {isEdit ? 'Product Updated!' : 'Product Created!'}
              </motion.h3>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className={`glass-card ${status === 'error' ? 'animate-shake' : ''}`}
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%' }}
        >
          <form id="product-form" onSubmit={handleSubmit} className="plm-form">
            <div className="field-group">
              <label className="plm-label">Product Name <span className="req">*</span></label>
              <input 
                className={`plm-input ${status === 'error' ? 'error' : ''}`} 
                name="name" 
                maxLength={255} 
                placeholder="e.g. Industrial Pump Mk3" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="field-group">
                <label className="plm-label">Sales Price <span className="req">*</span></label>
                <input 
                  className={`plm-input ${status === 'error' ? 'error' : ''}`} 
                  name="salePrice" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={form.salePrice} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="field-group">
                <label className="plm-label">Cost Price <span className="req">*</span></label>
                <input 
                  className={`plm-input ${status === 'error' ? 'error' : ''}`} 
                  name="costPrice" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={form.costPrice} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="field-group">
              <FileUpload 
                label="Attachments" 
                value={form.attachments} 
                onChange={setAttachments} 
              />
            </div>

            {!isEdit && (
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
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}
