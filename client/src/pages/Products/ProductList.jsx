import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Archive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';

export default function ProductList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/products', { params: { search } });
        setProducts(data);
      } catch {
        addToast('Failed to load products', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [search]);

  const canCreate = ['ENGINEERING_USER','ADMIN'].includes(user?.role);
  const canArchive = user?.role === 'ADMIN';

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Archive this product?')) return;
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
        <div className="toolbar">
          <input
            className="search-input"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

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
                  <th>Name</th>
                  <th>Version</th>
                  <th>Sale Price</th>
                  <th>Cost Price</th>
                  <th>Status</th>
                  {canArchive && <th></th>}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} onClick={() => navigate(`/products/${p.id}`)}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="plm-version-badge">v{p.currentVersion}</span></td>
                    <td>₹{parseFloat(p.salePrice).toLocaleString()}</td>
                    <td>₹{parseFloat(p.costPrice).toLocaleString()}</td>
                    <td><StatusBadge status={p.status} /></td>
                    {canArchive && (
                      <td>
                        {p.status === 'ACTIVE' && (
                          <button className="btn-icon btn-sm" title="Archive" onClick={e => handleArchive(e, p.id)}>
                            <Archive size={14} />
                          </button>
                        )}
                      </td>
                    )}
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
