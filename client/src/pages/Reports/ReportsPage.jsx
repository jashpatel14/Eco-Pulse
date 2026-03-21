import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Download } from 'lucide-react';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';

const TABS = ['ecos','versions','bom-history','archived','matrix'];
const TAB_LABELS = { ecos: 'ECO Report', versions: 'Version History', 'bom-history': 'BOM Changes', archived: 'Archived Products', matrix: 'Active Matrix' };

export default function ReportsPage() {
  const [tab, setTab] = useState('ecos');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/${tab}`)
      .then(r => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [tab]);

  const exportCSV = () => {
    if (!data.length) return;
    const keys = Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object' || data[0][k] === null);
    const rows = [keys.join(','), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${tab}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title"><BarChart2 size={22} style={{ display:'inline', marginRight: 8 }} />Reports</h1>
          <p className="page-desc">Analyse ECO activity, product versions, and BOM changes</p>
        </div>
        <button className="btn-outline btn-sm" onClick={exportCSV} disabled={!data.length}>
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

      <div className="glass-card">
        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : data.length === 0 ? (
          <div className="empty-state"><p>No data available for this report.</p></div>
        ) : (
          <motion.div className="table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {tab === 'ecos' && (
              <table className="plm-table">
                <thead><tr><th>Title</th><th>Type</th><th>Product</th><th>Risk</th><th>Status</th><th>Stage</th><th>By</th><th>Created</th></tr></thead>
                <tbody>
                  {data.map(eco => (
                    <tr key={eco.id} style={{ cursor: 'default' }}>
                      <td>{eco.title}</td>
                      <td><span className={eco.ecoType === 'BOM' ? 'eco-type-bom' : 'eco-type-product'}>{eco.ecoType}</span></td>
                      <td>{eco.product?.name}</td>
                      <td><RiskBadge level={eco.riskLevel} /></td>
                      <td><StatusBadge status={eco.status} /></td>
                      <td><span className="chip">{eco.stage?.name}</span></td>
                      <td className="text-dim">{eco.user?.name}</td>
                      <td className="text-dim">{new Date(eco.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'versions' && (
              <table className="plm-table">
                <thead><tr><th>Product</th><th>Version</th><th>Sale Price</th><th>Cost Price</th><th>Status</th><th>Created</th></tr></thead>
                <tbody>
                  {data.map(v => (
                    <tr key={v.id} style={{ cursor: 'default' }}>
                      <td>{v.product?.name}</td>
                      <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                      <td>₹{parseFloat(v.salePrice).toLocaleString()}</td>
                      <td>₹{parseFloat(v.costPrice).toLocaleString()}</td>
                      <td><StatusBadge status={v.status} /></td>
                      <td className="text-dim">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'bom-history' && (
              <table className="plm-table">
                <thead><tr><th>Reference</th><th>Product</th><th>Version</th><th>Components</th><th>Operations</th><th>Status</th></tr></thead>
                <tbody>
                  {data.map(b => (
                    <tr key={b.id} style={{ cursor: 'default' }}>
                      <td><strong>{b.reference}</strong></td>
                      <td>{b.product?.name}</td>
                      <td><span className="plm-version-badge">v{b.versionNumber}</span></td>
                      <td>{b.components?.length ?? 0}</td>
                      <td>{b.operations?.length ?? 0}</td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'archived' && (
              <table className="plm-table">
                <thead><tr><th>Product</th><th>Version</th><th>Sale Price</th><th>Cost Price</th><th>Archived On</th></tr></thead>
                <tbody>
                  {data.map(v => (
                    <tr key={v.id} style={{ cursor: 'default' }}>
                      <td>{v.product?.name}</td>
                      <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                      <td>₹{parseFloat(v.salePrice).toLocaleString()}</td>
                      <td>₹{parseFloat(v.costPrice).toLocaleString()}</td>
                      <td className="text-dim">{new Date(v.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'matrix' && (
              <table className="plm-table">
                <thead><tr><th>Product</th><th>Active Version</th><th>Active BOM</th><th>BOM Version</th><th>Last Changed</th></tr></thead>
                <tbody>
                  {data.map(row => (
                    <tr key={row.productId} style={{ cursor: 'default' }}>
                      <td><strong>{row.productName}</strong></td>
                      <td><span className="plm-version-badge">v{row.activeVersion}</span></td>
                      <td>{row.activeBomReference || '—'}</td>
                      <td>{row.activeBomVersion ? <span className="plm-version-badge">v{row.activeBomVersion}</span> : '—'}</td>
                      <td className="text-dim">{new Date(row.lastChanged).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
