import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, AlertTriangle, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';

const BOMRollback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [targetVer, setTargetVer] = useState(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOpsUser = user?.role === 'OPERATIONS_USER';
  const canRollback = ['ADMIN', 'ENGINEERING_USER'].includes(user?.role);

  useEffect(() => {
    api.get(`/bom-vc/history/${id}`)
      .then(res => { setHistory(res.data.history); setLoading(false); })
      .catch(() => { addToast("Failed to load BOM versions", "error"); setLoading(false); });
  }, [id]);

  const handleRollback = async () => {
    if (!rollbackReason) return addToast("Please provide a reason", "error");
    setSubmitting(true);
    try {
      const res = await api.post(`/bom-vc/rollback/${id}`, {
        targetVersion: targetVer.versionNumber,
        reason: rollbackReason
      });
      addToast(res.data.message, "success");
      // Navigate back to BOM detail to see the new active version
      navigate(`/boms/${id}`);
    } catch (err) {
      addToast(err.response?.data?.error || "Rollback failed", "error");
    } finally {
      setSubmitting(false);
      setModalOpen(false);
    }
  };

  if (loading) return <div className="plm-page"><div className="spinner"></div></div>;

  if (isOpsUser) return (
    <div className="plm-page" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
      <h1 className="page-title">Access Denied</h1>
      <p className="page-desc">Operations Users do not have access to BOM rollback features.</p>
      <button className="btn-plm" style={{ marginTop: '16px' }} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton />
          <h1 className="page-title">BOM Version Rollback</h1>
          <p className="page-desc">Restore a previous BOM state by creating a new Draft ECO</p>
        </div>
      </div>

      {!canRollback && (
        <div style={{ padding: '16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '24px' }}>
          Restricted: Only Engineering Users or Admins can initiate a BOM rollback.
        </div>
      )}

      <div className="glass-card">
        <div className="table-wrap">
          <table className="plm-table">
            <thead>
              <tr><th>Version</th><th>Reference</th><th>Origin ECO</th><th>Created</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {history.map((v, i) => (
                <tr key={v.id}>
                  <td><span className="plm-version-badge">{v.label}</span></td>
                  <td><code style={{ fontSize: '0.8rem' }}>{v.reference}</code></td>
                  <td>{v.ecoTitle}</td>
                  <td className="text-dim">{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td>
                    {v.isCurrent ? (
                      <span style={{ color: 'var(--brand)', fontWeight: 700 }}>CURRENT</span>
                    ) : (
                      <StatusBadge status={v.status} />
                    )}
                  </td>
                  <td>
                    {!v.isCurrent && canRollback && (
                      <button className="btn-outline btn-sm" style={{ color: '#e11d48', borderColor: '#e11d48' }}
                        onClick={() => { setTargetVer(v); setModalOpen(true); }}>
                        <RotateCcw size={14} /> Restore {v.label}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && targetVer && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#e11d48' }}>
              <AlertTriangle size={32} />
              <h2 className="modal-title" style={{ margin: 0 }}>Restore BOM {targetVer.label}</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              This will automatically restore all BOM components and metadata from <strong>{targetVer.label}</strong>.
              A system-generated ECO will be created and <strong>applied immediately</strong> to preserve the audit trail.
            </p>
            <div className="field-group" style={{ marginBottom: '20px' }}>
              <label className="plm-label">Reason for Rollback (Required)</label>
              <textarea className="plm-textarea" rows={3}
                placeholder="e.g., Reverting incorrect component change from ECO-007"
                value={rollbackReason}
                onChange={e => setRollbackReason(e.target.value)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-plm" style={{ background: '#e11d48' }} onClick={handleRollback} disabled={submitting}>
                {submitting ? 'Restoring Version...' : 'Confirm Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BOMRollback;
