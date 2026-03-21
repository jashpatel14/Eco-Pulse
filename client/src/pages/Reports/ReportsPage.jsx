import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Download, Search } from 'lucide-react';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';

const TABS = ['eco-summary', 'matrix', 'product-history', 'bom-history'];
const TAB_LABELS = { 
  'eco-summary': 'ECO Change Report', 
  'matrix': 'Product-BOM Matrix',
  'product-history': 'Product Version History',
  'bom-history': 'BoM Change History'
};

export default function ReportsPage() {
  const [tab, setTab] = useState('eco-summary');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [boms, setBoms] = useState([]);
  const [selectedBomId, setSelectedBomId] = useState('');

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data));
    api.get('/boms').then(r => setBoms(r.data));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/reports/${tab}`;
      if (tab === 'product-history' && selectedProductId) {
        url = `/reports/product-history/${selectedProductId}`;
      } else if (tab === 'bom-history' && selectedBomId) {
        url = `/reports/bom-history/${selectedBomId}`;
      } else if (tab === 'product-history' || tab === 'bom-history') {
        setData(null);
        setLoading(false);
        return;
      }

      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab, selectedProductId, selectedBomId]);

  const exportCSV = () => {
    const exportData = data?.ecos || data?.versions || data || [];
    if (!exportData.length) return;
    const keys = Object.keys(exportData[0]).filter(k => typeof exportData[0][k] !== 'object');
    const rows = [keys.join(','), ...exportData.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${tab}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="plm-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="page-header-left">
          <h1 className="page-title">Reporting</h1>
          <p className="page-desc">Comprehensive system reports and audit trails</p>
        </div>
        <button className="btn-outline btn-sm" onClick={exportCSV} disabled={!data}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {(tab === 'product-history' || tab === 'bom-history') && (
        <div className="glass-card" style={{ marginBottom: 20, padding: '16px 24px' }}>
          <div className="form-row" style={{ alignItems: 'flex-end', gap: 16 }}>
            {tab === 'product-history' ? (
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label className="plm-label">Select Product</label>
                <select className="plm-select" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                  <option value="">Choose a product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label className="plm-label">Select BOM Reference</label>
                <select className="plm-select" value={selectedBomId} onChange={e => setSelectedBomId(e.target.value)}>
                  <option value="">Choose a BOM...</option>
                  {boms.map(b => <option key={b.id} value={b.id}>{b.reference} (v{b.versionNumber})</option>)}
                </select>
              </div>
            )}
            <button className="btn-plm" onClick={fetchData} style={{ height: 42 }}>
              <Search size={18} /> Generate Report
            </button>
          </div>
        </div>
      )}

      <div className="glass-card">
        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : !data ? (
          <div className="empty-state">
            <BarChart2 size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <p>Select parameters above to generate report.</p>
          </div>
        ) : (
          <motion.div className="table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {tab === 'eco-summary' && (
              <>
                <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                   <div className="stat-pill"><strong>Total:</strong> {data.stats.total}</div>
                   <div className="stat-pill"><strong>Draft:</strong> {data.stats.draft}</div>
                   <div className="stat-pill"><strong>In Review:</strong> {data.stats.inReview}</div>
                   <div className="stat-pill"><strong>Applied:</strong> {data.stats.applied}</div>
                </div>
                <table className="plm-table">
                  <thead><tr><th>Title</th><th>Product</th><th>Status</th><th>Stage</th><th>By</th><th>Changes</th><th>Created</th></tr></thead>
                  <tbody>
                    {data.ecos.map(eco => (
                      <tr key={eco.id}>
                        <td>{eco.title}</td>
                        <td>{eco.product?.name}</td>
                        <td><StatusBadge status={eco.status} /></td>
                        <td><span className="chip">{eco.stage?.name}</span></td>
                        <td>{eco.user?.name}</td>
                        <td>{eco._count.draftChanges}</td>
                        <td className="text-dim">{new Date(eco.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {tab === 'matrix' && (
              <table className="plm-table">
                <thead><tr><th>Product Name</th><th>Current Version</th><th>Active BOM</th><th>BOM Version</th><th>Components</th></tr></thead>
                <tbody>
                  {data.map(row => (
                    <tr key={row.productId}>
                      <td><strong>{row.productName}</strong></td>
                      <td><span className="plm-version-badge">v{row.currentVersion}</span></td>
                      <td>{row.activeBOM?.reference || '—'}</td>
                      <td>{row.activeBOM ? row.activeBOM.versionNumber : '—'}</td>
                      <td>{row.activeBOM?.components?.length || 0} items</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'product-history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Version Timeline</h3>
                  <table className="plm-table">
                    <thead><tr><th>Version</th><th>Sale Price</th><th>Cost Price</th><th>Status</th><th>Created On</th></tr></thead>
                    <tbody>
                      {data.versions.map(v => (
                        <tr key={v.id}>
                          <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                          <td>₹{parseFloat(v.salePrice).toLocaleString()}</td>
                          <td>₹{parseFloat(v.costPrice).toLocaleString()}</td>
                          <td><StatusBadge status={v.status} /></td>
                          <td className="text-dim">{new Date(v.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Related ECOs</h3>
                  <table className="plm-table">
                    <thead><tr><th>ECO Title</th><th>Reason</th><th>Effective Date</th><th>User</th></tr></thead>
                    <tbody>
                      {data.ecos.map(eco => (
                        <tr key={eco.id}>
                          <td>{eco.title}</td>
                          <td>{eco.changeReason}</td>
                          <td>{eco.effectiveDate ? new Date(eco.effectiveDate).toLocaleDateString() : '—'}</td>
                          <td>{eco.user?.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'bom-history' && (
              <table className="plm-table">
                <thead><tr><th>Action</th><th>By</th><th>Details</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {data.map(log => (
                    <tr key={log.id}>
                      <td><span className="chip">{log.action.replace(/_/g,' ')}</span></td>
                      <td>{log.user?.name}</td>
                      <td style={{ maxWidth: 400 }}>{log.newValue || log.oldValue || '—'}</td>
                      <td className="text-dim">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </div>
      <style>{`
        .stat-pill { background: #f8fafc; padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
