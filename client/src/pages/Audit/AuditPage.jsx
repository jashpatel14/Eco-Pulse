import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import CustomSelect from '../../components/CustomSelect';
import api from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { formatLogDetail } from '../../utils/formatUtils';

const RECORD_TYPES = ['','PRODUCT','BOM','ECO'];

export default function AuditPage() {
  const { addToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ recordType: '', from: '', to: '' });

  const fetch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.recordType) params.recordType = filters.recordType;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const { data } = await api.get('/audit', { params });
      setLogs(data);
    } catch {
      addToast('Failed to load audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [filters]);

  const ACTION_COLOR = {
    PRODUCT_CREATED: 'hsl(140, 40%, 45%)', BOM_CREATED: 'hsl(215, 60%, 50%)', ECO_CREATED: 'hsl(260, 50%, 55%)',
    ECO_STARTED: 'hsl(45, 100%, 45%)', ECO_STAGE_ADVANCED: 'hsl(215, 60%, 50%)', ECO_VALIDATED: 'hsl(45, 100%, 45%)',
    ECO_APPROVED: 'hsl(140, 40%, 45%)', ECO_REJECTED: 'hsl(0, 100%, 50%)', ECO_APPLIED: 'hsl(260, 50%, 55%)',
    PRODUCT_ARCHIVED: 'hsl(220, 10%, 60%)',
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title"><Shield size={22} style={{ display:'inline', marginRight: 8 }} />Audit Log</h1>
          <p className="page-desc">Immutable record of all PLM system changes</p>
        </div>
      </div>

      <div className="filter-panel">
        <div style={{ minWidth: 200 }}>
          <label>Record Type</label>
          <CustomSelect 
            value={filters.recordType} 
            onChange={val => setFilters(f => ({ ...f, recordType: val }))} 
            options={RECORD_TYPES.map(r => ({ value: r, label: r || 'All' }))}
          />
        </div>
        <div>
          <label>From Date</label>
          <input className="plm-input" type="date" value={filters.from}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} />
        </div>
        <div>
          <label>To Date</label>
          <input className="plm-input" type="date" value={filters.to}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} />
        </div>
      </div>

      <div className="glass-card">
        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : logs.length === 0 ? (
          <div className="empty-state"><p>No audit log entries found.</p></div>
        ) : (
          <motion.div className="table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <table className="plm-table">
              <thead>
                <tr><th>Action</th><th>Record</th><th>Record ID</th><th>Details</th><th>By</th><th>Timestamp</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ cursor: 'default' }}>
                    <td>
                      <span style={{ 
                        display: 'inline-flex', padding: '3px 10px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700, 
                        background: `${ACTION_COLOR[log.action || ''] || '#a1a1aa'}18`, 
                        color: ACTION_COLOR[log.action || ''] || '#a1a1aa', 
                        border: `1px solid ${ACTION_COLOR[log.action || ''] || '#a1a1aa'}40` 
                      }}>
                        {(log.action || 'ACTION').replace(/_/g,' ')}
                      </span>
                    </td>
                    <td><span className="chip">{log.recordType || '—'}</span></td>
                    <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>
                      {log.recordId ? `${String(log.recordId).slice(0, 8)}…` : '—'}
                    </td>
                    <td className="text-dim" style={{ maxWidth: 300 }}>
                      {formatLogDetail(log.newValue || log.oldValue)}
                    </td>
                    <td>{log.user?.name || '—'}</td>
                    <td className="text-muted">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
