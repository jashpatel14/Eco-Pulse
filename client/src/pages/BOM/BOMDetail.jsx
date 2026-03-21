import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ClipboardList, GitPullRequest, Edit } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

export default function BOMDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isEngineer = user?.role === 'ENGINEERING_USER';
  const isApprover = user?.role === 'APPROVER';
  const canRaiseECO = (isAdmin || isEngineer || isApprover);
  const [bom, setBom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('components');

  useEffect(() => {
    api.get(`/boms/${id}`).then(({ data }) => {
      setBom(data); setLoading(false);
    }).catch(() => {
      addToast('BOM not found.', 'error');
      navigate('/boms');
    });
  }, [id]);

  if (loading) return <div className="plm-page"><div className="empty-state"><div className="spinner"></div></div></div>;
  if (!bom) return null;

  const totalCost = bom.components.reduce((acc, c) => acc + (parseFloat(c.quantity) * parseFloat(c.unitCost || 0)), 0);

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">{bom.reference}</h1>
          <p className="page-desc">Bill of Materials Detail</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
            <StatusBadge status={bom.status} />
            <span className="plm-version-badge">v{bom.versionNumber}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>• {bom.product?.name}</span>
          </div>
        </div>
        <div className="page-actions">
          {canRaiseECO && (
            <button className="btn-plm" onClick={() => navigate('/ecos/new', { state: { bomId: bom.id, productId: bom.productId, ecoType: 'BOM' } })}>
              <GitPullRequest size={18} /> Raise ECO
            </button>
          )}
          {isAdmin && (
            <button className="btn-outline" onClick={() => navigate(`/boms/${id}/edit`)}>
              <Edit size={18} /> Edit BOM
            </button>
          )}
        </div>
      </div>

      <div className="tab-bar">
        {[['components','Components'],['operations','Operations'],['history','BOM History']].map(([key,label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'components' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="text-dim">{bom.components.length} components</span>
            <span className="chip">Total Cost: ₹{totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="table-wrap">
            <table className="plm-table">
              <thead><tr><th>Component</th><th>Qty</th><th>Make/Buy</th><th>Supplier</th><th>Unit Cost</th><th>Line Total</th></tr></thead>
              <tbody>
                {bom.components.map(c => (
                  <tr key={c.id} style={{ cursor: 'default' }}>
                    <td><strong>{c.componentName}</strong></td>
                    <td>{parseFloat(c.quantity)}</td>
                    <td><span className={`make-buy-badge ${c.makeOrBuy === 'MAKE' ? 'badge-make' : 'badge-buy'}`}>{c.makeOrBuy}</span></td>
                    <td>{c.supplier || '—'}</td>
                    <td>{c.unitCost ? `₹${parseFloat(c.unitCost).toFixed(2)}` : '—'}</td>
                    <td>{c.unitCost ? `₹${(parseFloat(c.quantity) * parseFloat(c.unitCost)).toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'operations' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-wrap">
            <table className="plm-table">
              <thead><tr><th>Operation</th><th>Duration (min)</th><th>Work Center</th></tr></thead>
              <tbody>
                {bom.operations.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No operations defined.</td></tr>
                ) : bom.operations.map(op => (
                  <tr key={op.id} style={{ cursor: 'default' }}>
                    <td><strong>{op.operationName}</strong></td>
                    <td>{op.durationMins} min</td>
                    <td>{op.workCenter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {tab === 'history' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="table-wrap">
            <table className="plm-table">
              <thead><tr><th>Reference</th><th>Version</th><th>Status</th><th>Created</th></tr></thead>
              <tbody>
                {(bom.product?.boms || []).map(b => (
                  <tr key={b.id} onClick={() => navigate(`/boms/${b.id}`)} style={{ cursor: 'pointer', fontWeight: b.id === bom.id ? 600 : 400 }}>
                    <td>{b.reference}{b.id === bom.id && <span className="chip" style={{ marginLeft: 8 }}>current</span>}</td>
                    <td><span className="plm-version-badge">v{b.versionNumber}</span></td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="text-dim">{new Date(b.created_at).toLocaleDateString()}</td>
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
