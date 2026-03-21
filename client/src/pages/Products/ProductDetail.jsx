import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, GitPullRequest, Edit, Clock, GitCompare, UserCheck, RotateCcw, Paperclip } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';
import BackButton from '../../components/BackButton';
import { getFileUrl } from '../../utils/fileUtils';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const isEngineer = user?.role === 'ENGINEERING_USER';
  const isApprover = user?.role === 'APPROVER';
  const isOpsUser = user?.role === 'OPERATIONS_USER';
  const canRaiseECO = (isAdmin || isEngineer || isApprover);
  const canEdit = isAdmin;
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

  const margin = parseFloat(product.salePrice) > 0 
    ? (((parseFloat(product.salePrice) - parseFloat(product.costPrice)) / parseFloat(product.salePrice)) * 100).toFixed(1) 
    : parseFloat(0).toFixed(1);

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton />
          <h1 className="page-title">{product.name}</h1>
          <p className="page-desc">Product Master Record</p>
        </div>
        <div className="page-actions">
          {canEdit && (
            <button className="btn-outline" onClick={() => navigate(`/products/${id}/edit`)}>
              <Edit size={18} /> Edit Product
            </button>
          )}
          {canRaiseECO && (
            <button className="btn-plm" onClick={() => navigate('/ecos/new', { state: { productId: id, ecoType: 'PRODUCT' } })}>
              <GitPullRequest size={18} /> Raise ECO
            </button>
          )}
        </div>
      </div>

      <div className="tab-bar">
        {['info', 'vcs'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'info' ? 'Product Info' : 'Version History & Control'}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div className="detail-grid">
              <div className="detail-field">
                <label>Status</label>
                <StatusBadge status={product.status} />
              </div>
              <div className="detail-field">
                <label>Current Version</label>
                <span className="plm-version-badge">v{product.currentVersion}</span>
              </div>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-field"><label>Product Name</label><span>{product.name}</span></div>
            <div className="detail-field"><label>Current Version</label><span className="plm-version-badge">v{product.currentVersion}</span></div>
            <div className="detail-field"><label>Sale Price</label><span>₹{parseFloat(product.salePrice).toLocaleString()}</span></div>
            <div className="detail-field"><label>Cost Price</label><span>₹{parseFloat(product.costPrice).toLocaleString()}</span></div>
            <div className="detail-field"><label>Margin</label><span style={{ color: parseFloat(margin) > 20 ? '#34d399' : '#fbbf24' }}>{margin}%</span></div>
          </div>

          {product.attachments?.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 24 }}>Attachments</div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.attachments.map((att, i) => (
                  <a 
                    key={i} 
                    href={getFileUrl(att)} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="chip" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 16px',
                      textDecoration: 'none',
                      color: 'var(--brand-deep)',
                      background: 'white',
                      border: '1px solid var(--border-light)',
                      transition: 'all var(--ts)'
                    }}
                  >
                    <Paperclip size={14} />
                    <span style={{ fontWeight: 500 }}>{att.split('/').pop().replace(/^\d+-[\da-f]+-/, '')}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'vcs' && (
        <div>
          <div className="section-title">Version Control & Audit</div>
          <div className="detail-grid">
            <div className="glass-card hover-card" onClick={() => navigate(`/products/${id}/history`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
              <Clock size={32} color="var(--brand)" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: 0 }}>Full History</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visualize ECO timeline & audit logs</p>
            </div>
            
            <div className="glass-card hover-card" onClick={() => navigate(`/products/${id}/compare`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
              <GitCompare size={32} color="#fbbf24" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: 0 }}>Compare Versions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Side-by-side BOM diffing</p>
            </div>

            {!isOpsUser && (
              <div className="glass-card hover-card" onClick={() => navigate(`/products/${id}/blame`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
                <UserCheck size={32} color="#059669" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: 0 }}>Blame (Contributors)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trace each field to its origin ECO</p>
              </div>
            )}

            {(isAdmin || isEngineer) && (
              <div className="glass-card hover-card" onClick={() => navigate(`/products/${id}/rollback`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
                <RotateCcw size={32} color="#e11d48" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: 0 }}>Rollback</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Safely revert to a previous state</p>
              </div>
            )}
          </div>

          <div className="section-title" style={{ marginTop: '32px' }}>All Versions</div>
          <div className="glass-card">
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
          </div>
        </div>
      )}
    </div>
  );
}
