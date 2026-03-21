import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RotateCcw, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ProductRollback = () => {
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
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/version-control/history/${id}`);
        setHistory(res.data.history);
      } catch (err) {
        addToast("Failed to load versions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id, addToast]);

  const handleRollback = async () => {
    if (!rollbackReason) return addToast("Please provide a reason", "error");
    setSubmitting(true);
    try {
      const res = await api.post(`/version-control/rollback/${id}`, {
        targetVersion: targetVer.versionNumber,
        reason: rollbackReason
      });
      addToast(res.data.message, "success");
      navigate(`/ecos/${res.data.ecoId}`);
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
      <p className="page-desc">Operations Users do not have access to rollback features.</p>
      <button className="btn-plm mt-4" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton />
          <h1 className="page-title">Version Rollback (Revert)</h1>
          <p className="page-desc">Safely restore the product state to a previous version</p>
        </div>
      </div>

      {!canRollback && (
        <div style={{ padding: '16px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '24px' }}>
          Restricted: Only Engineering Users or Admins can initiate a rollback.
        </div>
      )}

      <div className="glass-card">
        <div className="table-wrap">
          <table className="plm-table">
            <thead>
              <tr><th>Version</th><th>Origin ECO</th><th>Created</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {history.map((v, i) => (
                <tr key={v.versionNumber}>
                  <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                  <td>{v.ecoTitle}</td>
                  <td className="text-dim">{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td>
                    {i === 0 ? (
                      <span style={{ color: 'var(--brand)', fontWeight: 700 }}>ACTIVE</span>
                    ) : (
                      <span style={{ color: 'var(--text-dim)' }}>Archived</span>
                    )}
                  </td>
                  <td>
                    {i !== 0 && canRollback && (
                      <button className="btn-outline btn-sm" style={{ color: '#e11d48', borderColor: '#e11d48' }} onClick={() => { setTargetVer(v); setModalOpen(true); }}>
                        <RotateCcw size={14} /> Restore v{v.versionNumber}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#e11d48' }}>
              <AlertTriangle size={32} />
              <h2 className="modal-title" style={{ margin: 0 }}>Restore Version {targetVer.versionNumber}</h2>
            </div>
            
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              This will create a new <strong>Draft ECO</strong> to restore all components and metadata from version {targetVer.versionNumber}. 
              The ECO must go through the normal approval workflow before any changes are applied. No existing data will be deleted.
            </p>

            <div className="field-group" style={{ marginBottom: '20px' }}>
              <label className="plm-label">Reason for Rollback (Required)</label>
              <textarea 
                className="plm-textarea" 
                rows={3} 
                placeholder="e.g., Reverting incorrect BOM update from ECO-005"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
              <button className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn-plm" style={{ background: '#e11d48' }} onClick={handleRollback} disabled={submitting}>
                {submitting ? 'Creating ECO...' : 'Initiate Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRollback;
