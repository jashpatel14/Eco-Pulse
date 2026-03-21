import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GitCompare, Plus, Minus, RefreshCcw, ShieldAlert } from 'lucide-react';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DiffTable from '../../components/DiffTable';
import CustomSelect from '../../components/CustomSelect';

const ProductCompare = () => {
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

  // 1. Fetch history to populate dropdowns
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/version-control/history/${id}`);
        setHistory(res.data.history);
        if (res.data.history.length >= 2) {
          setFromVer(res.data.history[1].versionNumber);
          setToVer(res.data.history[0].versionNumber);
        } else if (res.data.history.length === 1) {
          setFromVer(res.data.history[0].versionNumber);
          setToVer(res.data.history[0].versionNumber);
        }
      } catch (err) {
        addToast("Failed to load versions", "error");
      }
    };
    fetchHistory();
  }, [id]);

  // 2. Fetch diff when versions change
  useEffect(() => {
    if (!fromVer || !toVer) return;
    const fetchDiff = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/version-control/compare/${id}?from=${fromVer}&to=${toVer}`);
        setDiff(res.data);
      } catch (err) {
        const msg = err.response?.data?.error || "Failed to compare versions";
        addToast(msg, "error");
        setDiff(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDiff();
  }, [fromVer, toVer, id]);

  const rawSorted = [...history].sort((a,b) => a.versionNumber - b.versionNumber);
  const sortedHistory = isOpsUser ? rawSorted.filter(v => v.status === 'ACTIVE') : rawSorted;

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton />
          <h1 className="page-title">Compare Versions</h1>
          <p className="page-desc">Visualize differences between any two BOM versions</p>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>Base Version</label>
            <CustomSelect 
              value={fromVer} 
              onChange={val => setFromVer(val)} 
              options={sortedHistory.map(v => ({ value: v.versionNumber, label: `${v.label} (${v.ecoTitle || 'Initial Setup'})` }))}
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
              options={[...sortedHistory].reverse().map(v => ({ value: v.versionNumber, label: `${v.label} (${v.ecoTitle || 'Initial Setup'})` }))}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><div className="spinner"></div></div>
      ) : diff ? (
        <>
          {/* Summary Bar */}
          <div style={{ 
            display: 'flex', gap: '2px', height: '10px', 
            borderRadius: '5px', overflow: 'hidden', marginBottom: '16px',
            background: 'var(--border-light)'
          }}>
            {diff.summary.added > 0 && <div style={{ flex: diff.summary.added, background: '#059669' }} />}
            {diff.summary.removed > 0 && <div style={{ flex: diff.summary.removed, background: '#e11d48' }} />}
            {diff.summary.changed > 0 && <div style={{ flex: diff.summary.changed, background: '#d97706' }} />}
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', marginBottom: '32px' }}>
             <span style={{ color: '#059669', fontWeight: 700 }}>+{diff.summary.added} added</span>
             <span style={{ color: '#e11d48', fontWeight: 700 }}>-{diff.summary.removed} removed</span>
             <span style={{ color: '#d97706', fontWeight: 700 }}>~{diff.summary.changed} changed</span>
             <span style={{ color: 'var(--text-muted)' }}>={diff.summary.same} unchanged</span>
          </div>

          <DiffTable data={diff.productFields} title="Product Metadata" />
          <DiffTable data={diff.components} title="BOM Components" />
          <DiffTable data={diff.operations} title="Manufacturing Operations" />
        </>
      ) : null}
    </div>
  );
};

export default ProductCompare;
