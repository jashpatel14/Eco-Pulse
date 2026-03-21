import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';

export default function BOMList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleGlobalSearch = (e) => setSearch(e.detail);
    window.addEventListener('topNavSearch', handleGlobalSearch);
    return () => window.removeEventListener('topNavSearch', handleGlobalSearch);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/boms', { params: { search } });
        setBoms(data);
      } catch {
        addToast('Failed to load BOMs.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search]);

  const canCreate = ['ENGINEERING_USER','ADMIN'].includes(user?.role);

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title"><ClipboardList size={22} style={{ display:'inline', marginRight: 8 }} />Bills of Materials</h1>
          <p className="page-desc">View and manage all BOM records</p>
        </div>
        {canCreate && (
          <button className="btn-plm" onClick={() => navigate('/boms/new')}>
            <Plus size={18} /> New BOM
          </button>
        )}
      </div>

      <div className="glass-card">
        {/* Local toolbar search removed in favor of global navbar search */}


        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : boms.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} style={{ margin: '0 auto 12px' }} />
            <p>No BOMs found. {canCreate && 'Start by creating one.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <motion.table className="plm-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <thead>
                <tr><th>Reference</th><th>Finished Product</th><th>Quantity</th><th>Version</th><th>Status</th></tr>
              </thead>
              <tbody>
                {boms.map((bom, i) => (
                  <motion.tr 
                    key={bom.id} 
                    onClick={() => navigate(`/boms/${bom.id}`)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td><strong>{bom.reference}</strong></td>
                    <td>{bom.product?.name || '—'}</td>
                    <td style={{ fontWeight: 500 }}>{parseFloat(bom.quantity || 0)}</td>
                    <td><span className="plm-version-badge">v{bom.versionNumber}</span></td>
                    <td><StatusBadge status={bom.status} /></td>
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
