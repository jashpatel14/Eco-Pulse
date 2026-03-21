import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitCompare, ShieldAlert } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DiffTable from '../../components/DiffTable';

const BOMCompare = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const isOpsUser = user?.role === 'OPERATIONS_USER';

  const [history, setHistory] = useState([]);
  const [fromVer, setFromVer] = useState('');
  const [toVer, setToVer] = useState('');
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/bom-vc/history/${id}`).then(res => {
      const h = res.data.history;
      setHistory(h);
      if (h.length >= 2) { setFromVer(h[1].versionNumber); setToVer(h[0].versionNumber); }
      else if (h.length === 1) { setFromVer(h[0].versionNumber); setToVer(h[0].versionNumber); }
    }).catch(() => addToast("Failed to load BOM versions", "error"));
  }, [id]);

  useEffect(() => {
    if (!fromVer || !toVer) return;
    setLoading(true);
    api.get(`/bom-vc/compare/${id}?from=${fromVer}&to=${toVer}`)
      .then(res => { setDiff(res.data); setLoading(false); })
      .catch(err => {
        const msg = err.response?.data?.error || "Failed to compare BOM versions";
        addToast(msg, "error");
        setDiff(null);
        setLoading(false);
      });
  }, [fromVer, toVer, id]);

  const rawSorted = [...history].sort((a, b) => a.versionNumber - b.versionNumber);
  const sortedHistory = isOpsUser ? rawSorted.filter(v => v.status === 'ACTIVE') : rawSorted;

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">Compare BOM Versions</h1>
          <p className="page-desc">Side-by-side comparison of component and operation changes</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Base Version</label>
            <select className="plm-select" value={fromVer} onChange={e => setFromVer(e.target.value)}>
              {sortedHistory.map(v => <option key={v.versionNumber} value={v.versionNumber}>{v.label} — {v.ecoTitle}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '44px', color: 'var(--text-dim)' }}>
            <GitCompare size={20} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Compare With</label>
            <select className="plm-select" value={toVer} onChange={e => setToVer(e.target.value)}>
              {[...sortedHistory].reverse().map(v => <option key={v.versionNumber} value={v.versionNumber}>{v.label} — {v.ecoTitle}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : diff ? (
        <>
          <div style={{ display: 'flex', gap: '2px', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px', background: 'var(--border-light)' }}>
            {Array.from({ length: diff.summary.added }).map((_, i) => <div key={`a-${i}`} style={{ flex: 1, background: '#059669' }} />)}
            {Array.from({ length: diff.summary.removed }).map((_, i) => <div key={`r-${i}`} style={{ flex: 1, background: '#e11d48' }} />)}
            {Array.from({ length: diff.summary.changed }).map((_, i) => <div key={`c-${i}`} style={{ flex: 1, background: '#d97706' }} />)}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', marginBottom: '32px' }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>+{diff.summary.added} added</span>
            <span style={{ color: '#e11d48', fontWeight: 700 }}>-{diff.summary.removed} removed</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>~{diff.summary.changed} changed</span>
            <span style={{ color: 'var(--text-muted)' }}>={diff.summary.same} unchanged</span>
          </div>
          <DiffTable data={diff.components} title="BOM Components" />
          <DiffTable data={diff.operations} title="Manufacturing Operations" />
        </>
      ) : null}
    </div>
  );
};

export default BOMCompare;
