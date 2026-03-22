import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle, ChevronRight, SkipForward, Paperclip } from 'lucide-react';
import BackButton from '../../components/BackButton';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import ECOStageBar from '../../components/ECOStageBar';
import LeadTimeBadge from '../../components/LeadTimeBadge';
import DiffView from './DiffView';
import { getFileUrl } from '../../utils/fileUtils';
import { formatLogDetail } from '../../utils/formatUtils';

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
  const isEngineer = user?.role === 'ENGINEERING_USER';
  const isApprover = user?.role === 'APPROVER';

  const isApproverForStage = eco.stage?.approval_rules?.some(r => r.userId === user?.id);
  const stageRequiresApproval = eco.stage?.approvalRequired;

  const canApproveOrReject = (isApproverForStage || isAdmin) && eco.status === 'IN_REVIEW';
  const canValidate = !stageRequiresApproval && eco.status === 'IN_REVIEW' && (isEngineer || isAdmin);
  const canApply = (user?.role === 'OPERATIONS_USER' || isAdmin) && eco.status === 'APPROVED';
  const canStart = isCreator && eco.status === 'DRAFT';
  const canEdit = (isCreator || isAdmin) && eco.status === 'DRAFT';
  const canSeeAudit = isAdmin || isApprover || isCreator;

  const doAction = async (action, body = {}) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/ecos/${id}/${action}`, body);
      setEco(data);
      addToast(`ECO ${action === 'apply' ? 'implemented' : action + 'd'} successfully.`, 'success');
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
          <BackButton />
          <h1 className="page-title">{eco.title}</h1>
          <p className="page-desc">Engineering Change Order Detail</p>
        </div>
        <div className="page-actions">
          {canStart && (
            <button className="btn-plm" onClick={doStart} disabled={actionLoading}>
               <Play size={18} /> Start ECO
            </button>
          )}
          {canApproveOrReject && (
            <>
              <button 
                className="btn-success" 
                onClick={() => doAction('approve')} 
                disabled={actionLoading}
              >
                 <CheckCircle size={18} /> Approve
              </button>
              <button 
                className="btn-danger" 
                onClick={() => setRejectModal(true)} 
                disabled={actionLoading} 
              >
                 <XCircle size={18} /> Reject
              </button>
            </>
          )}
          {canValidate && (
            <button className="btn-plm" onClick={() => doAction('approve')} disabled={actionLoading}>
               <CheckCircle size={18} /> Validate
            </button>
          )}

          {canApply && (
            <button className="btn-success" style={{ background: 'var(--brand-deep)' }} onClick={() => doAction('apply')} disabled={actionLoading}>
               <CheckCircle size={18} /> Apply Change
            </button>
          )}

          {canEdit && (
            <>
               <button className="btn-plm" onClick={() => navigate(`/ecos/new?id=${id}`)}>
                   Edit Info
               </button>
               {eco.ecoType === 'PRODUCT' && (
                 <button className="btn-outline" onClick={() => navigate(`/ecos/${id}/edit-product`)}>
                    Edit Product
                 </button>
               )}
               {eco.ecoType === 'BOM' && (
                 <button className="btn-outline" onClick={() => navigate(`/ecos/${id}/edit-bom`)}>
                    Edit BOM
                 </button>
               )}
            </>
          )}
          
          {eco.status === 'APPLIED' && (
            <span className="chip" style={{ fontSize: '0.85rem', padding: '8px 16px', fontWeight: 600, background: '#e6fffa', color: '#2c7a7b', border: '1px solid #b2f5ea' }}>
               ECO Implemented (Applied)
            </span>
          )}
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab-btn ${tab === 'diff' ? 'active' : ''}`} onClick={() => setTab('diff')}>Changes</button>
        {canSeeAudit && (
          <button className={`tab-btn ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>Audit Trail</button>
        )}
      </div>

      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Stage Bar below action area */}
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <ECOStageBar stages={stages} currentStageId={eco.stageId} ecoStatus={eco.status} />
        </div>

        <div className="plm-form">
          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Reference</label>
              <div style={{ fontWeight: 700, color: 'var(--brand-deep)', fontSize: '1.1rem' }}>{eco.reference || '—'}</div>
            </div>
            <div className="field-group">
              <label className="plm-label">Priority</label>
              <RiskBadge risk={eco.priority || 'MEDIUM'} />
            </div>
          </div>

          <div className="field-group">
            <label className="plm-label">Title <span className="req">*</span></label>
            <input className="plm-input" readOnly value={eco.title} />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">ECO Type <span className="req">*</span></label>
              <input className="plm-input" readOnly value={eco.ecoType === 'BOM' ? 'Bill of Materials' : 'Products'} />
            </div>
            <div className="field-group">
              <label className="plm-label">Product <span className="req">*</span></label>
              <input className="plm-input" readOnly value={eco.product?.name || '—'} />
            </div>
          </div>

          {eco.ecoType === 'BOM' && (
            <div className="field-group">
              <label className="plm-label">Bill of Materials <span className="req">*</span></label>
              <input className="plm-input" readOnly value={eco.bom?.reference || '—'} />
            </div>
          )}

          <div className="field-group">
            <label className="plm-label">User <span className="req">*</span></label>
            <input className="plm-input" readOnly value={eco.user?.name || 'Admin1'} />
          </div>

          <div className="form-row">
            <div className="field-group">
              <label className="plm-label">Effective Date</label>
              <input className="plm-input" readOnly value={eco.effectiveDate ? new Date(eco.effectiveDate).toLocaleDateString() : '—'} />
            </div>
            <div className="field-group" style={{ justifyContent: 'flex-end', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" checked={eco.versionUpdate} readOnly />
                <label className="plm-label" style={{ marginBottom: 0 }}>Version Update</label>
              </div>
            </div>
          </div>

          {eco.attachments?.length > 0 && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <label className="plm-label">Attachments</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                {eco.attachments.map((att, i) => (
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
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <Paperclip size={14} />
                    <span style={{ fontWeight: 500 }}>{att.split('/').pop().replace(/^\d+-[\da-f]+-/, '')}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {tab === 'diff' && (
        <div style={{ marginTop: '20px' }}>
          <DiffView eco={eco} />
        </div>
      )}

      {tab === 'audit' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px' }}>
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
                      <td className="text-dim" style={{ maxWidth: 350 }}>
                        {formatLogDetail(log.newValue || log.oldValue)}
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
