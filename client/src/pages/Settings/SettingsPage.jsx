import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Plus, Trash2, GripVertical } from 'lucide-react';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'stages';
  
  const setTab = (t) => setSearchParams({ tab: t });
  
  const [stages, setStages] = useState([]);
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [newStage, setNewStage] = useState({ name: '', approvalRequired: false });
  const [newRule, setNewRule] = useState({ stageId: '', userId: '', approvalCategory: 'REQUIRED' });
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [stagesRes, rulesRes, usersRes] = await Promise.all([
      api.get('/stages'), api.get('/approvals'), api.get('/users'),
    ]);
    setStages(stagesRes.data);
    setRules(rulesRes.data);
    setUsers(usersRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const addStage = async () => {
    if (!newStage.name.trim()) { addToast('Stage name is required.', 'error'); return; }
    try {
      await api.post('/stages', newStage);
      addToast('Stage created.', 'success');
      setNewStage({ name: '', approvalRequired: false });
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create stage.', 'error');
    }
  };

  const deleteStage = async (id) => {
    if (!window.confirm('Delete this stage?')) return;
    try {
      await api.delete(`/stages/${id}`);
      addToast('Stage deleted.', 'success');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete stage.', 'error');
    }
  };

  const addRule = async () => {
    if (!newRule.stageId || !newRule.userId) { addToast('Stage and user are required.', 'error'); return; }
    try {
      await api.post('/approvals', newRule);
      addToast('Approval rule created.', 'success');
      setNewRule({ stageId: '', userId: '', approvalCategory: 'REQUIRED' });
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create rule.', 'error');
    }
  };

  const deleteRule = async (id) => {
    try {
      await api.delete(`/approvals/${id}`);
      addToast('Approval rule deleted.', 'success');
      fetchAll();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete rule.', 'error');
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title"><Settings size={22} style={{ display:'inline', marginRight: 8 }} />Settings</h1>
          <p className="page-desc">Configure ECO stages and approval rules</p>
        </div>
      </div>

      <div className="tab-bar">
        {[['stages','ECO Stages'],['approvals','Approval Rules']].map(([key,label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : tab === 'stages' ? (
        <>
          <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="section-title">Current Stages</h3>
            <div className="table-wrap">
              <table className="plm-table">
                <thead><tr><th>Order</th><th>Name</th><th>Approval Required</th><th></th></tr></thead>
                <tbody>
                  {stages.map((s, i) => (
                    <tr key={s.id} style={{ cursor: 'default' }}>
                      <td className="text-dim">{i + 1}</td>
                      <td><strong>{s.name}</strong></td>
                      <td>{s.approvalRequired ? <span style={{ color: 'var(--brand)' }}>✓ Yes</span> : <span className="text-muted">—</span>}</td>
                      <td>
                        {s.name !== 'New' && s.name !== 'Done' && (
                          <button className="btn-danger btn-sm" onClick={() => deleteStage(s.id)}>
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div className="glass-card" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="section-title">Add Stage</h3>
            <p className="text-dim" style={{ fontSize: '0.82rem', marginBottom: 16 }}>
              New stages are inserted before the "Done" stage automatically.
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="field-group" style={{ flex: 1 }}>
                <label className="plm-label">Stage Name</label>
                <input className="plm-input" placeholder="e.g. Engineering Review" value={newStage.name}
                  onChange={e => setNewStage(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div style={{ paddingBottom: 2 }}>
                <label className="checkbox-label">
                  <input type="checkbox" checked={newStage.approvalRequired}
                    onChange={e => setNewStage(prev => ({ ...prev, approvalRequired: e.target.checked }))} />
                  Requires designated approver
                </label>
              </div>
              <button className="btn-plm" onClick={addStage}><Plus size={16} /> Add Stage</button>
            </div>
          </motion.div>
        </>
      ) : (
        <>
          <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="section-title">Approval Rules</h3>
            <div className="table-wrap">
              <table className="plm-table">
                <thead><tr><th>Stage</th><th>Approver</th><th>Category</th><th></th></tr></thead>
                <tbody>
                  {rules.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No approval rules configured.</td></tr>
                  ) : rules.map(r => (
                    <tr key={r.id} style={{ cursor: 'default' }}>
                      <td><span className="chip">{r.stage?.name}</span></td>
                      <td>{r.user?.name} <span className="text-dim" style={{ fontSize: '0.78rem' }}>({r.user?.email})</span></td>
                      <td><span className={r.approvalCategory === 'REQUIRED' ? 'badge-in-review status-badge' : 'status-badge badge-draft'}>{r.approvalCategory}</span></td>
                      <td><button className="btn-danger btn-sm" onClick={() => deleteRule(r.id)}><Trash2 size={12} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div className="glass-card" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="section-title">Add Approval Rule</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field-group" style={{ flex: 1 }}>
                <label className="plm-label">Stage</label>
                <select className="plm-select" value={newRule.stageId} onChange={e => setNewRule(p => ({ ...p, stageId: e.target.value }))}>
                  <option value="">Select stage…</option>
                  {stages.filter(s => s.approvalRequired).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="field-group" style={{ flex: 1 }}>
                <label className="plm-label">Approver</label>
                <select className="plm-select" value={newRule.userId} onChange={e => setNewRule(p => ({ ...p, userId: e.target.value }))}>
                  <option value="">Select user…</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="plm-label">Category</label>
                <select className="plm-select" value={newRule.approvalCategory} onChange={e => setNewRule(p => ({ ...p, approvalCategory: e.target.value }))}>
                  <option value="REQUIRED">Required</option>
                  <option value="OPTIONAL">Optional</option>
                </select>
              </div>
              <button className="btn-plm" onClick={addRule}><Plus size={16} /> Add Rule</button>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
