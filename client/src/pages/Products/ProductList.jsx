import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Archive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';

import { useConfirm } from '../../context/ConfirmContext';

export default function ProductList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearch(e.detail);
      setSkip(0);
    };
    window.addEventListener('topNavSearch', handleGlobalSearch);
    return () => window.removeEventListener('topNavSearch', handleGlobalSearch);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/products', { params: { search, take: 50, skip } });
        if (skip === 0) {
          setProducts(data);
        } else {
          setProducts(prev => [...prev, ...data]);
        }
        setHasMore(data.length === 50);
      } catch {
        addToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search, skip]);

  const canCreate = ['ENGINEERING_USER','ADMIN'].includes(user?.role);
  const canArchive = user?.role === 'ADMIN';

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Archive Product?',
      message: 'This will move the product to the archives. It will no longer appear in active lists.',
      confirmText: 'Archive',
      cancelText: 'Cancel',
      type: 'danger'
    });
    if (!ok) return;
    
    try {
      await api.patch(`/products/${id}/archive`);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'ARCHIVED' } : p));
      addToast('Product archived.', 'success');
    } catch {
      addToast('Failed to archive product.', 'error');
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title"><Package size={24} style={{ display:'inline', marginRight: 8 }} />Products</h1>
          <p className="page-desc">Manage your product master records</p>
        </div>
        {canCreate && (
          <button className="btn-plm" onClick={() => navigate('/products/new')}>
            <Plus size={18} /> New Product
          </button>
        )}
      </div>

      <div className="glass-card">
        {/* Local toolbar search removed in favor of global navbar search */}


        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} style={{ margin: '0 auto 12px' }} />
            <p>No products found. {canCreate && 'Start by creating one.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <motion.table className="plm-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Version</th>
                  <th>Status</th>
                  {canArchive && <th></th>}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <motion.tr 
                    key={p.id} 
                    onClick={() => navigate(`/products/${p.id}`)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td><strong>{p.name}</strong></td>
                    <td><span className="plm-version-badge">v{p.currentVersion}</span></td>
                    <td><StatusBadge status={p.status} /></td>
                    {canArchive && (
                      <td>
                        {p.status === 'ACTIVE' && (
                          <button 
                            className="btn-icon btn-icon-danger" 
                            title="Archive Product" 
                            onClick={e => handleArchive(e, p.id)}
                            style={{ marginLeft: 'auto' }}
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
            
            {hasMore && !loading && (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <button className="btn-outline" onClick={() => setSkip(prev => prev + 50)}>
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
