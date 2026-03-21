import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, GitCommit } from 'lucide-react';
import api from '../../api/api';
import BackButton from '../../components/BackButton';
import { useToast } from '../../context/ToastContext';
import VersionTimeline from '../../components/VersionTimeline';

const ProductHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/version-control/history/${id}`);
        setData(res.data);
      } catch (err) {
        addToast("Failed to load history", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  if (loading) return <div className="plm-page"><div className="spinner"></div></div>;
  if (!data) return <div className="plm-page">Product not found</div>;

  const history = data?.history || [];
  const contributors = new Set(history.map(v => v.createdBy)).size;

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <BackButton />
          <h1 className="page-title">Version History: {data.productName}</h1>
          <p className="page-desc">Complete audit trail of all applied Engineering Change Orders</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="detail-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--brand-soft)', borderRadius: '12px' }}>
            <Clock size={24} color="var(--brand)" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Versions</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.totalVersions}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '12px' }}>
            <GitCommit size={24} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied ECOs</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.appliedEcoCount}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: '#ecfdf5', borderRadius: '12px' }}>
            <Users size={24} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contributors</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{contributors}</div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--brand-soft)', borderRadius: '12px' }}>
            <span style={{ fontWeight: 800, color: 'var(--brand)' }}>{data.currentVersion}</span>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest Version</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.currentVersion}</div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '40px' }}>
        <VersionTimeline history={history} />
      </div>
    </div>
  );
};

export default ProductHistory;
