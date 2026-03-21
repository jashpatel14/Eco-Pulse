import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Download, Search, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
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
// track current view to switch content
const [tab, setTab] = useState('eco-summary');
// holds results from backend api
const [data, setData] = useState(null);
// show spinner while network is busy
const [loading, setLoading] = useState(false);
// list for the dropdown filter
const [products, setProducts] = useState([]);
// choice for history report filter
const [selectedProductId, setSelectedProductId] = useState('');
// list for the other dropdown filter
const [boms, setBoms] = useState([]);
// choice for history report filter
const [selectedBomId, setSelectedBomId] = useState('');
const { addToast } = useToast();

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data));
    api.get('/boms').then(r => setBoms(r.data));
  }, []);

// grab data whenever tab or filters change
  const fetchData = async () => {
    // start loading state immediately
    setLoading(true);
    try {
      // build path based on current tab
      let url = `/reports/${tab}`;
      // add specific id for history reports
      if (tab === 'product-history' && selectedProductId) {
        url = `/reports/product-history/${selectedProductId}`;
      // add specific id for history reports
      } else if (tab === 'bom-history' && selectedBomId) {
        url = `/reports/bom-history/${selectedBomId}`;
      // stop if user hasn't picked an id yet
      } else if (tab === 'product-history' || tab === 'bom-history') {
        const type = tab === 'product-history' ? 'Product' : 'BOM';
        addToast(`Please select a ${type} to generate the history report.`, 'warning');
        // clear old results
        setData(null);
        // turn off loader
        setLoading(false);
        // skip network call
        return;
      }

      // ask server for report data
      const res = await api.get(url);
      // save results to local state
      setData(res.data);
    } catch (err) {
      // log failure for debugging
      console.error(err);
      addToast('Failed to generate report. Please try again.', 'error');
      // reset data if request fails
      setData(null);
    } finally {
      // always stop loading spinner
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
            {tab === 'eco-summary' && data?.ecos && (
              <>
                {/* show high level totals */}
                <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                   <div className="stat-pill"><strong>Total:</strong> {data.stats?.total || 0}</div>
                   <div className="stat-pill"><strong>Draft:</strong> {data.stats?.draft || 0}</div>
                   <div className="stat-pill"><strong>In Review:</strong> {data.stats?.inReview || 0}</div>
                   <div className="stat-pill"><strong>Applied:</strong> {data.stats?.applied || 0}</div>
                </div>
                {/* detailed list of changes */}
                <table className="plm-table">
                  <thead><tr><th>Title</th><th>Product</th><th>Status</th><th>Stage</th><th>By</th><th>Changes</th><th>Created</th></tr></thead>
                  <tbody>
                    {/* render each eco from list */}
                    {data.ecos.map(eco => (
                      <tr key={eco.id}>
                        <td>{eco.title}</td>
                        {/* show linked product name */}
                        <td>{eco.product?.name}</td>
                        {/* visual color bubble for status */}
                        <td><StatusBadge status={eco.status} /></td>
                        {/* current process step */}
                        <td><span className="chip">{eco.stage?.name}</span></td>
                        {/* person who made it */}
                        <td>{eco.user?.name}</td>
                        {/* count of parts affected */}
                        <td>{eco._count?.draftChanges || 0}</td>
                        {/* readable creation date */}
                        <td className="text-dim">{new Date(eco.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {tab === 'matrix' && Array.isArray(data) && (
              <table className="plm-table">
                <thead><tr><th>Product Name</th><th>Current Version</th><th>Active BOM</th><th>BOM Version</th><th>Components</th></tr></thead>
                <tbody>
                  {/* iterate through product matrix data */}
                  {data.map(row => (
                    <tr key={row.productId}>
                      {/* bold product name for clarity */}
                      <td><strong>{row.productName}</strong></td>
                      {/* display current release version */}
                      <td><span className="plm-version-badge">v{row.currentVersion}</span></td>
                      {/* show name of the manufacturing bill */}
                      <td>{row.activeBOM?.reference || '—'}</td>
                      {/* show which version of the bill is used */}
                      <td>{row.activeBOM ? row.activeBOM.versionNumber : '—'}</td>
                      {/* total count of parts in this bill */}
                      <td>{row.activeBOM?.components?.length || 0} items</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'product-history' && data?.versions && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div>
                  <h3 style={{ marginBottom: 16, fontSize: '1.1rem' }}>Version Timeline</h3>
                  <table className="plm-table">
                    <thead><tr><th>Version</th><th>Sale Price</th><th>Cost Price</th><th>Status</th><th>Created On</th></tr></thead>
                    <tbody>
                      {/* list every historical release of product */}
                      {data.versions.map(v => (
                        <tr key={v.id}>
                          <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                          {/* show customer facing price */}
                          <td>₹{parseFloat(v.salePrice || 0).toLocaleString()}</td>
                          {/* show internal manufacturing cost */}
                          <td>₹{parseFloat(v.costPrice || 0).toLocaleString()}</td>
                          {/* current lifecycle state of version */}
                          <td><StatusBadge status={v.status} /></td>
                          {/* precise time this version went live */}
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
                      {/* show changes that triggered these versions */}
                      {(data.ecos || []).map(eco => (
                        <tr key={eco.id}>
                          <td>{eco.title}</td>
                          {/* brief explanation for the change */}
                          <td>{eco.changeReason}</td>
                          {/* date the change took effect */}
                          <td>{eco.effectiveDate ? new Date(eco.effectiveDate).toLocaleDateString() : '—'}</td>
                          {/* engineer who submitted the change */}
                          <td>{eco.user?.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 'bom-history' && Array.isArray(data) && (
              <table className="plm-table">
                <thead><tr><th>Action</th><th>By</th><th>Details</th><th>Timestamp</th></tr></thead>
                <tbody>
                  {/* show chronological order of all edits */}
                  {data.map(log => (
                    <tr key={log.id}>
                      {/* type of modification made */}
                      <td><span className="chip">{log.action?.replace(/_/g,' ') || 'ACTION'}</span></td>
                      {/* person who performed the action */}
                      <td>{log.user?.name}</td>
                      {/* specific data that was changed */}
                      <td style={{ maxWidth: 400 }}>{log.newValue || log.oldValue || '—'}</td>
                      {/* exact time of the modification */}
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









/*
FILE SUMMARY
------------
What this file does: Manages and displays the reports dashboard.
Why it exists: Provides users with clear audit trails and project summaries.
Main functions: ReportsPage, fetchData, exportCSV
Connects to: Sidebar.jsx for navigation, api.js for data.
Danger zones: Data mapping crashes if API returns empty stats.
*/

