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
  const [showFilters, setShowFilters] = useState(true);
  
  useEffect(() => {
    const handleGlobalSearch = (e) => setFilters(f => ({ ...f, search: e.detail }));
    window.addEventListener('topNavSearch', handleGlobalSearch);
    return () => window.removeEventListener('topNavSearch', handleGlobalSearch);
  }, []);

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
          <h1 className="page-title">Engineering Change Orders (ECO's)</h1>
        </div>
        <div className="page-actions">
          {canCreate && (
            <button className="btn-plm btn-sm" onClick={() => navigate('/ecos/new')}>
              <Plus size={18} /> New ECO
            </button>
          )}
          <button className="btn-outline btn-sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          {/* Global search used instead of local input */}
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
                  <th>Name / Title</th><th>Type</th><th>Product</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {ecos.map((eco, i) => (
                  <motion.tr 
                    key={eco.id} 
                    onClick={() => navigate(`/ecos/${eco.id}`)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td><strong>{eco.title}</strong></td>
                    <td>
                      {eco.ecoType === 'BOM' ? (
                        <span className="eco-type-bom">BoM</span>
                      ) : (
                        <span className="eco-type-product">Product</span>
                      )}
                    </td>
                    <td>{eco.product?.name || '—'}</td>
                    <td><StatusBadge status={eco.status} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}
      </div>
    </div>
  );
}
