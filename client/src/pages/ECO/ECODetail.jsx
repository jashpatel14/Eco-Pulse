import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, CheckCircle, XCircle, ChevronRight, SkipForward } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import ECOStageBar from '../../components/ECOStageBar';
import LeadTimeBadge from '../../components/LeadTimeBadge';

export default function ECODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [eco, setEco] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchEco = async () => {
    const [ecoRes, stagesRes] = await Promise.all([
      api.get(`/ecos/${id}`),
      api.get('/stages'),
    ]);
    setEco(ecoRes.data);
    setStages(stagesRes.data);
  };

  useEffect(() => {
    fetchEco().catch(() => { addToast('ECO not found.', 'error'); navigate('/ecos'); }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="plm-page"><div className="empty-state"><div className="spinner"></div></div></div>;
  if (!eco) return null;

  const isCreator = eco.userId === user?.id;
  const isAdmin   = user?.role === 'ADMIN';
  const isApproverForStage = eco.stage?.approval_rules?.some(r => r.userId === user?.id);
  const stageRequiresApproval = eco.stage?.approvalRequired;
  const canApproveOrReject = (isApproverForStage || isAdmin) && eco.status === 'IN_REVIEW';
  const canValidate = !stageRequiresApproval && eco.status === 'IN_REVIEW' && ['ENGINEERING_USER','ADMIN'].includes(user?.role);

  const doAction = async (action, body = {}) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/ecos/${id}/${action}`, body);
      setEco(data);
      addToast(`ECO ${action}d successfully.`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || `Failed to ${action} ECO.`, 'error');
    } finally {
      setActionLoading(false);
      setRejectModal(false);
      setRejectReason('');
    }
  };

  const doStart = async () => {
    setActionLoading(true);
    try {
      const { data } = await api.patch(`/ecos/${id}/start`);
      setEco(data);
      addToast('ECO started — fields are now locked.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to start ECO.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 8 }}>
            <ArrowLeft size={16} /> ECOs
          </button>
          <h1 className="page-title">{eco.title}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={eco.status} />
            <RiskBadge level={eco.riskLevel} />
            <span className={eco.ecoType === 'BOM' ? 'eco-type-bom' : 'eco-type-product'}>{eco.ecoType}</span>
            {eco.effectiveDate && <LeadTimeBadge effectiveDate={eco.effectiveDate} />}
          </div>
        </div>
        <div className="page-actions">
          {eco.status === 'DRAFT' && isCreator && (
            <button className="btn-warning" onClick={doStart} disabled={actionLoading}>
              <Play size={16} /> Start Review
            </button>
          )}
          {canValidate && (
            <button className="btn-warning" onClick={() => doAction('validate')} disabled={actionLoading}>
              <SkipForward size={16} /> Advance Stage
            </button>
          )}
          {canApproveOrReject && (
            <>
              <button className="btn-danger" onClick={() => setRejectModal(true)} disabled={actionLoading}>
                <XCircle size={16} /> Reject
              </button>
              <button className="btn-success" onClick={() => doAction('approve')} disabled={actionLoading}>
                <CheckCircle size={16} /> Approve
              </button>
            </>
          )}
          {eco.status === 'APPLIED' && (
            <span className="applied-tag"><CheckCircle size={16} /> Applied</span>
          )}
        </div>
      </div>

      {/* Stage bar */}
      <div className="glass-card" style={{ marginBottom: 20, padding: '16px 24px' }}>
        <ECOStageBar stages={stages} currentStageId={eco.stageId} ecoStatus={eco.status} />
      </div>

      <div className="tab-bar">
        {[['overview','Overview'],['audit','Audit Trail']].map(([key,label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="detail-grid">
            <div className="detail-field"><label>Product</label>
              <span style={{ cursor: 'pointer', color: 'var(--brand-primary)' }} onClick={() => navigate(`/products/${eco.productId}`)}>
                {eco.product?.name} (v{eco.product?.currentVersion})
              </span>
            </div>
            {eco.bom && (
              <div className="detail-field"><label>BOM</label>
                <span style={{ cursor: 'pointer', color: 'var(--brand-primary)' }} onClick={() => navigate(`/boms/${eco.bomId}`)}>
                  {eco.bom?.reference}
                </span>
              </div>
            )}
            <div className="detail-field"><label>Change Reason</label><span>{eco.changeReason?.replace(/_/g,' ')}</span></div>
            <div className="detail-field"><label>Risk Level</label><RiskBadge level={eco.riskLevel} /></div>
            <div className="detail-field"><label>Version Update</label><span>{eco.versionUpdate ? '✓ Create new version' : '✗ In-place update'}</span></div>
            <div className="detail-field"><label>Current Stage</label><span className="chip">{eco.stage?.name}</span></div>
            <div className="detail-field"><label>Created By</label><span>{eco.user?.name}</span></div>
            <div className="detail-field"><label>Created At</label><span>{new Date(eco.created_at).toLocaleDateString()}</span></div>
            {eco.effectiveDate && (
              <div className="detail-field"><label>Effective Date</label><span>{new Date(eco.effectiveDate).toLocaleDateString()}</span></div>
            )}
          </div>

          {eco.draftChanges?.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 24 }}>Draft Changes ({eco.draftChanges.length})</div>
              <div className="table-wrap">
                <table className="plm-table">
                  <thead><tr><th>Record Type</th><th>Field</th><th>Old Value</th><th>New Value</th></tr></thead>
                  <tbody>
                    {eco.draftChanges.map(c => (
                      <tr key={c.id} style={{ cursor: 'default' }}>
                        <td><span className="chip">{c.recordType}</span></td>
                        <td>{c.fieldName}</td>
                        <td className="text-dim">{c.oldValue ?? '—'}</td>
                        <td>{c.newValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {eco.stage?.approval_rules?.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 24 }}>Designated Approvers for Current Stage</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {eco.stage.approval_rules.map(r => (
                  <div key={r.id} className="chip">
                    {r.user?.name} · <span style={{ opacity: 0.7 }}>{r.approvalCategory}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      )}

      {tab === 'audit' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {!eco.auditLogs?.length ? (
            <div className="empty-state"><p>No audit trail entries yet.</p></div>
          ) : (
            <div className="table-wrap">
              <table className="plm-table">
                <thead><tr><th>Action</th><th>By</th><th>Details</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {eco.auditLogs.map(log => (
                    <tr key={log.id} style={{ cursor: 'default' }}>
                      <td><span className="chip">{log.action.replace(/_/g,' ')}</span></td>
                      <td>{log.user?.name || '—'}</td>
                      <td className="text-dim" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.newValue || log.oldValue || '—'}
                      </td>
                      <td className="text-dim">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Reject ECO</h3>
            <p className="text-dim" style={{ fontSize: '0.88rem', marginBottom: 14 }}>
              Provide a detailed rejection reason (minimum 20 characters). The ECO will be returned to DRAFT.
            </p>
            <textarea className="plm-textarea" placeholder="Rejection reason…"
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setRejectModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={() => doAction('reject', { reason: rejectReason })}
                disabled={rejectReason.trim().length < 20 || actionLoading}>
                <XCircle size={16} /> Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
