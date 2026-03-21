import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, GitPullRequest, HistoryIcon } from 'lucide-react';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch {
        addToast('Product not found.', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="plm-page"><div className="empty-state"><div className="spinner"></div></div></div>;
  if (!product) return null;

  const margin = (((parseFloat(product.salePrice) - parseFloat(product.costPrice)) / parseFloat(product.salePrice)) * 100).toFixed(1);

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={16} /> Products
          </button>
          <h1 className="page-title"><Package size={22} style={{ display:'inline', marginRight: 8 }} />{product.name}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <StatusBadge status={product.status} />
            <span className="plm-version-badge">Version {product.currentVersion}</span>
          </div>
        </div>
        <button className="btn-plm btn-sm" onClick={() => navigate(`/ecos/new?productId=${product.id}`)}>
          <GitPullRequest size={16} /> Raise ECO
        </button>
      </div>

      <div className="tab-bar">
        {['info', 'versions'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'info' ? 'Product Info' : 'Version History'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="detail-grid">
            <div className="detail-field"><label>Product Name</label><span>{product.name}</span></div>
            <div className="detail-field"><label>Status</label><StatusBadge status={product.status} /></div>
            <div className="detail-field"><label>Current Version</label><span className="plm-version-badge">v{product.currentVersion}</span></div>
            <div className="detail-field"><label>Sale Price</label><span>₹{parseFloat(product.salePrice).toLocaleString()}</span></div>
            <div className="detail-field"><label>Cost Price</label><span>₹{parseFloat(product.costPrice).toLocaleString()}</span></div>
            <div className="detail-field"><label>Margin</label><span style={{ color: parseFloat(margin) > 20 ? '#34d399' : '#fbbf24' }}>{margin}%</span></div>
          </div>

          {product.attachments?.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 24 }}>Attachments</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.attachments.map((att, i) => (
                  <a key={i} href={att} target="_blank" rel="noreferrer" className="chip">{att.split('/').pop()}</a>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {tab === 'versions' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-wrap">
            <table className="plm-table">
              <thead>
                <tr><th>Version</th><th>Sale Price</th><th>Cost Price</th><th>Status</th><th>Created</th></tr>
              </thead>
              <tbody>
                {product.versions.map(v => (
                  <tr key={v.id} style={{ cursor: 'default' }}>
                    <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                    <td>₹{parseFloat(v.salePrice).toLocaleString()}</td>
                    <td>₹{parseFloat(v.costPrice).toLocaleString()}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td className="text-dim">{new Date(v.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
