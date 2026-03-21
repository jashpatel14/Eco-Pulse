import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, GitPullRequest, Edit, Clock, GitCompare, UserCheck, RotateCcw } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import { useToast } from '../../context/ToastContext';

export default function BOMDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'ADMIN';
  const isEngineer = user?.role === 'ENGINEERING_USER';
  const isApprover = user?.role === 'APPROVER';
  const isOpsUser = user?.role === 'OPERATIONS_USER';
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
        {[['components','Components'],['operations','Operations'],['vcs','Version Control']].map(([key,label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'components' && (
        <div className="glass-card">
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
        </div>
      )}

      {tab === 'operations' && (
        <div className="glass-card">
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
        </div>
      )}

      {tab === 'vcs' && (
        <div>
          <div className="section-title">BOM Version Control</div>
          <div className="detail-grid">
            <div className="glass-card hover-card" onClick={() => navigate(`/boms/${id}/history`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
              <Clock size={32} color="var(--brand)" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: 0 }}>Full History</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Timeline of all BOM versions</p>
            </div>

            <div className="glass-card hover-card" onClick={() => navigate(`/boms/${id}/compare`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
              <GitCompare size={32} color="#fbbf24" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: 0 }}>Compare Versions</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Side-by-side component diff</p>
            </div>

            {!isOpsUser && (
              <div className="glass-card hover-card" onClick={() => navigate(`/boms/${id}/blame`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
                <UserCheck size={32} color="#059669" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: 0 }}>Blame View</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Trace components to their origin ECO</p>
              </div>
            )}

            {(isAdmin || isEngineer) && (
              <div className="glass-card hover-card" onClick={() => navigate(`/boms/${id}/rollback`)} style={{ cursor: 'pointer', padding: '24px', textAlign: 'center' }}>
                <RotateCcw size={32} color="#e11d48" style={{ marginBottom: '12px' }} />
                <h3 style={{ margin: 0 }}>Rollback</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Restore a previous BOM state</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
