import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Download, Search, TrendingUp, PieChart as PieIcon, List } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import CustomSelect from '../../components/CustomSelect';

const TABS = ['eco-summary', 'matrix', 'product-history', 'bom-history'];
const TAB_LABELS = { 
  'eco-summary': 'ECO Analytics', 
  'matrix': 'Product-BOM Matrix',
  'product-history': 'Price Trends',
  'bom-history': 'Change Logs'
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ReportsPage() {
  const [tab, setTab] = useState('eco-summary');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [boms, setBoms] = useState([]);
  const [selectedBomId, setSelectedBomId] = useState('');
  const { addToast } = useToast();

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
        const type = tab === 'product-history' ? 'Product' : 'BOM';
        addToast(`Please select a ${type} to generate the report.`, 'warning');
        setData(null);
        setLoading(false);
        return;
      }

      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      addToast('Failed to generate report.', 'error');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setData(null);
    if (tab === 'eco-summary' || tab === 'matrix') {
      fetchData();
    }
  }, [tab]);

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

  // --- Chart Data Preparation ---
  const getEcoStatusData = () => {
    if (!data?.stats) return [];
    return [
      { name: 'Draft', value: data.stats.draft || 0 },
      { name: 'In Review', value: data.stats.inReview || 0 },
      { name: 'Applied', value: data.stats.applied || 0 },
    ].filter(d => d.value > 0);
  };

  const getEcoStageData = () => {
    if (!data?.ecos) return [];
    const stages = {};
    data.ecos.forEach(eco => {
      const sName = eco.stage?.name || 'Unknown';
      stages[sName] = (stages[sName] || 0) + 1;
    });
    return Object.keys(stages).map(name => ({ name, count: stages[name] }));
  };

  const getPriceTrendData = () => {
    if (!data?.versions) return [];
    return [...data.versions].reverse().map(v => ({
      version: `v${v.versionNumber}`,
      salePrice: parseFloat(v.salePrice || 0),
      costPrice: parseFloat(v.costPrice || 0),
    }));
  };

  const getBomActionData = () => {
    if (!Array.isArray(data)) return [];
    const actions = {};
    data.forEach(log => {
      const a = log.action?.split('_')[0] || 'ACTION';
      actions[a] = (actions[a] || 0) + 1;
    });
    return Object.keys(actions).map(name => ({ name, count: actions[name] }));
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Advanced Reporting</h1>
          <p className="page-desc">Data-driven insights and interactive PLM analytics</p>
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

      <AnimatePresence mode="wait">
        {(tab === 'product-history' || tab === 'bom-history') && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass-card" style={{ marginBottom: 20, padding: '16px 24px' }}
          >
            <div className="form-row" style={{ alignItems: 'flex-end', gap: 16 }}>
              {tab === 'product-history' ? (
                <div className="field-group" style={{ marginBottom: 0, minWidth: 260 }}>
                  <label className="plm-label">Select Product</label>
                  <CustomSelect 
                    value={selectedProductId} 
                    onChange={val => setSelectedProductId(val)} 
                    placeholder="Choose a product..."
                    options={products.map(p => ({ value: p.id, label: p.name }))}
                  />
                </div>
              ) : (
                <div className="field-group" style={{ marginBottom: 0, minWidth: 260 }}>
                  <label className="plm-label">Select BOM Reference</label>
                  <CustomSelect 
                    value={selectedBomId} 
                    onChange={val => setSelectedBomId(val)} 
                    placeholder="Choose a BOM..."
                    options={boms.map(b => ({ value: b.id, label: `${b.reference} (v${b.versionNumber})` }))}
                  />
                </div>
              )}
              <button className="btn-plm" onClick={fetchData} style={{ height: 46 }}>
                <Search size={18} /> Generate Analytics
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-card" style={{ minHeight: '400px' }}>
        {loading ? (
          <div className="empty-state"><div className="spinner"></div></div>
        ) : !data ? (
          <div className="empty-state">
            <BarChart2 size={48} style={{ opacity: 0.1, marginBottom: 16 }} />
            <p>Configure and generate the report to view analytics.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            
            {/* --- ECO ANALYTICS TAB --- */}
            {tab === 'eco-summary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div className="report-grid">
                  <div className="chart-container">
                    <h4 className="chart-title"><PieIcon size={16} /> Status Distribution</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={getEcoStatusData()} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {getEcoStatusData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-container">
                    <h4 className="chart-title"><BarChart2 size={16} /> ECO Velocity by Stage</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={getEcoStageData()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="count" fill="var(--brand)" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="table-wrap">
                  <h4 className="chart-title"><List size={16} /> Recent Changes Details</h4>
                  <table className="plm-table" style={{ marginTop: 12 }}>
                    <thead><tr><th>Title</th><th>Product</th><th>Status</th><th>By</th><th>Created</th></tr></thead>
                    <tbody>
                      {Array.isArray(data?.ecos) && data.ecos.map(eco => (
                        <tr key={eco.id}>
                          <td><strong>{eco.title}</strong></td>
                          <td>{eco.product?.name}</td>
                          <td><StatusBadge status={eco.status} /></td>
                          <td>{eco.user?.name}</td>
                          <td className="text-dim">{new Date(eco.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- PRODUCT PRICE TRENDS TAB --- */}
            {tab === 'product-history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div className="chart-container" style={{ width: '100%' }}>
                  <h4 className="chart-title"><TrendingUp size={16} /> Selling Price vs. Mfg Cost Over Time</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getPriceTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="version" stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="salePrice" name="Sale Price" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="costPrice" name="Mfg Cost" stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="table-wrap">
                  <table className="plm-table">
                    <thead><tr><th>Version</th><th>Sale Price</th><th>Cost Price</th><th>Status</th><th>Created On</th></tr></thead>
                    <tbody>
                      {Array.isArray(data?.versions) && data.versions.map(v => (
                        <tr key={v.id}>
                          <td><span className="plm-version-badge">v{v.versionNumber}</span></td>
                          <td>₹{parseFloat(v.salePrice || 0).toLocaleString()}</td>
                          <td>₹{parseFloat(v.costPrice || 0).toLocaleString()}</td>
                          <td><StatusBadge status={v.status} /></td>
                          <td className="text-dim">{new Date(v.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- BOM LOGS TAB --- */}
            {tab === 'bom-history' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div className="chart-container" style={{ maxWidth: '600px' }}>
                  <h4 className="chart-title"><BarChart2 size={16} /> Modification Type Analysis</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={getBomActionData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={80} fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="table-wrap">
                  <table className="plm-table">
                    <thead><tr><th>Action</th><th>By</th><th>Details</th><th>Timestamp</th></tr></thead>
                    <tbody>
                      {Array.isArray(data) && data.map(log => (
                        <tr key={log.id}>
                          <td><span className="chip">{log.action?.replace(/_/g,' ')}</span></td>
                          <td>{log.user?.name}</td>
                          <td style={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.newValue || log.oldValue || '—'}</td>
                          <td className="text-dim">{new Date(log.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- MATRIX TAB --- */}
            {tab === 'matrix' && (
              <div className="table-wrap">
                <table className="plm-table">
                  <thead><tr><th>Product Name</th><th>Current Version</th><th>Active BOM</th><th>BOM Version</th><th>Components</th></tr></thead>
                  <tbody>
                    {Array.isArray(data) && data.map(row => (
                      <tr key={row.productId}>
                        <td><strong>{row.productName}</strong></td>
                        <td><span className="plm-version-badge">v{row.currentVersion}</span></td>
                        <td>{row.activeBOM?.reference || '—'}</td>
                        <td>{row.activeBOM ? row.activeBOM.versionNumber : '—'}</td>
                        <td className="text-muted">{row.activeBOM?.components?.length || 0} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </motion.div>
        )}
      </div>

      <style>{`
        .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding-bottom: 8px; }
        .chart-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; }
        .chart-title { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 700; color: #475569; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.05em; }
        @media (max-width: 1024px) { .report-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

