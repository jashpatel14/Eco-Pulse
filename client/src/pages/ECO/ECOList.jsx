import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitPullRequest, Plus, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import LeadTimeBadge from '../../components/LeadTimeBadge';

const ECO_STATUSES = ['','DRAFT','IN_REVIEW','APPROVED','REJECTED','APPLIED'];
const RISK_LEVELS  = ['','HIGH','MEDIUM','LOW'];
const ECO_TYPES    = ['','PRODUCT','BOM'];

export default function ECOList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [ecos, setEcos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', riskLevel: '', ecoType: '', search: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {};
        if (filters.status) params.status = filters.status;
        if (filters.riskLevel) params.riskLevel = filters.riskLevel;
        if (filters.ecoType) params.ecoType = filters.ecoType;
        if (filters.search) params.search = filters.search;
        const { data } = await api.get('/ecos', { params });
        setEcos(data);
      } catch {
        addToast('Failed to load ECOs.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters]);

  const canCreate = ['ENGINEERING_USER','ADMIN'].includes(user?.role);

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title"><GitPullRequest size={22} style={{ display:'inline', marginRight: 8 }} />Engineering Change Orders</h1>
          <p className="page-desc">Track and manage product and BOM change requests</p>
        </div>
        <div className="page-actions">
          <button className="btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filters
          </button>
          {canCreate && (
            <button className="btn-plm" onClick={() => navigate('/ecos/new')}>
              <Plus size={18} /> New ECO
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div>
            <label>Search</label>
            <input className="plm-input" placeholder="Title or product name..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
          </div>
          <div>
            <label>Status</label>
            <select className="plm-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
              {ECO_STATUSES.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
            </select>
          </div>
          <div>
            <label>Risk</label>
            <select className="plm-select" value={filters.riskLevel} onChange={e => setFilters(f => ({ ...f, riskLevel: e.target.value }))}>
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r || 'All'}</option>)}
            </select>
          </div>
          <div>
            <label>Type</label>
            <select className="plm-select" value={filters.ecoType} onChange={e => setFilters(f => ({ ...f, ecoType: e.target.value }))}>
              {ECO_TYPES.map(t => <option key={t} value={t}>{t || 'All'}</option>)}
            </select>
          </div>
        </div>
      )}

      <div className="glass-card">
        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : ecos.length === 0 ? (
          <div className="empty-state">
            <GitPullRequest size={48} style={{ margin: '0 auto 12px' }} />
            <p>No ECOs found. {canCreate && 'Raise one to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <motion.table className="plm-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <thead>
                <tr>
                  <th>Title</th><th>Type</th><th>Product</th><th>Stage</th>
                  <th>Risk</th><th>Lead Time</th><th>Status</th><th>By</th>
                </tr>
              </thead>
              <tbody>
                {ecos.map(eco => (
                  <tr key={eco.id} onClick={() => navigate(`/ecos/${eco.id}`)}>
                    <td><strong>{eco.title}</strong></td>
                    <td><span className={eco.ecoType === 'BOM' ? 'eco-type-bom' : 'eco-type-product'}>{eco.ecoType}</span></td>
                    <td>{eco.product?.name || '—'}</td>
                    <td><span className="chip">{eco.stage?.name || '—'}</span></td>
                    <td><RiskBadge level={eco.riskLevel} /></td>
                    <td>{eco.effectiveDate ? <LeadTimeBadge effectiveDate={eco.effectiveDate} /> : <span className="dimmed">—</span>}</td>
                    <td><StatusBadge status={eco.status} /></td>
                    <td className="text-dim">{eco.user?.name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}
      </div>
    </div>
  );
}
