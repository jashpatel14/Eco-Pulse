import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitCompare, Check, AlertCircle } from 'lucide-react';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DiffTable from '../../components/DiffTable';
import CustomSelect from '../../components/CustomSelect';

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
      const h = res.data?.history || [];
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
          <BackButton />
          <h1 className="page-title">Compare BOM Versions</h1>
          <p className="page-desc">Side-by-side comparison of component and operation changes</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Base Version</label>
            <CustomSelect 
              value={fromVer} 
              onChange={val => setFromVer(val)} 
              options={sortedHistory.map(v => ({ value: v.versionNumber, label: `v${v.versionNumber} — ${v.ecoTitle || 'Initial Setup'}` }))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', height: '44px', color: 'var(--text-dim)' }}>
            <GitCompare size={20} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Compare With</label>
            <CustomSelect 
              value={toVer} 
              onChange={val => setToVer(val)} 
              options={[...sortedHistory].reverse().map(v => ({ value: v.versionNumber, label: `v${v.versionNumber} — ${v.ecoTitle || 'Initial Setup'}` }))}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : diff ? (
        <>
          <div style={{ display: 'flex', gap: '2px', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '16px', background: 'var(--border-light)' }}>
            {(diff.summary?.added || 0) > 0 && <div style={{ flex: diff.summary.added, background: '#059669' }} />}
            {(diff.summary?.removed || 0) > 0 && <div style={{ flex: diff.summary.removed, background: '#e11d48' }} />}
            {(diff.summary?.changed || 0) > 0 && <div style={{ flex: diff.summary.changed, background: '#d97706' }} />}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', marginBottom: '32px' }}>
            <span style={{ color: '#059669', fontWeight: 700 }}>+{diff.summary?.added || 0} added</span>
            <span style={{ color: '#e11d48', fontWeight: 700 }}>-{diff.summary?.removed || 0} removed</span>
            <span style={{ color: '#d97706', fontWeight: 700 }}>~{diff.summary?.changed || 0} changed</span>
            <span style={{ color: 'var(--text-muted)' }}>={diff.summary?.same || 0} unchanged</span>
          </div>
          <DiffTable data={diff.components} title="BOM Components" />
          <DiffTable data={diff.operations} title="Manufacturing Operations" />
        </>
      ) : null}
    </div>
  );
};

export default BOMCompare;
