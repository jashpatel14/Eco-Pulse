import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Search, Info, ShieldAlert, Lock } from 'lucide-react';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import BlameRow from '../../components/BlameRow';

const ProductBlame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const isOpsUser = user?.role === 'OPERATIONS_USER';
  const isApprover = user?.role === 'APPROVER';
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchBlame = async () => {
      try {
        const res = await api.get(`/version-control/blame/${id}`);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setAccessDenied(true);
        }
        const msg = err.response?.data?.error || "Failed to load blame data";
        addToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchBlame();
  }, [id]);

  if (loading) return <div className="plm-page"><div className="spinner"></div></div>;
  
  if (accessDenied || isOpsUser) return (
    <div className="plm-page" style={{ textAlign: 'center', paddingTop: '100px' }}>
      <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
      <h1 className="page-title">Access Denied</h1>
      <p className="page-desc">Operations Users do not have access to engineering blame data.</p>
      <button className="btn-plm mt-4" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  if (!data) return <div className="plm-page">Data not found</div>;

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn-outline btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title">Who Changed What (Git Blame)</h1>
          <p className="page-desc">Trace each BOM component and product field back to its origin ECO</p>
        </div>
      </div>

      {isApprover && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '8px', marginBottom: '24px', color: '#854d0e', fontSize: '0.85rem' }}>
          <Lock size={16} />
          <strong>Read-Only Mode:</strong> Approvers can view lineage data but cannot initiate changes here.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', marginBottom: '24px', color: '#1e40af', fontSize: '0.85rem' }}>
        <Info size={16} />
        This view shows the person and ECO responsible for the <strong>latest version</strong> of each item.
      </div>

      <div className="section-title">Product Metadata</div>
      <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '32px' }}>
        {data.productFields.map((f, i) => <BlameRow key={i} data={f} />)}
      </div>

      <div className="section-title">BOM Components</div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {data.components.length === 0 ? (
          <div className="empty-state">No components in the current BOM</div>
        ) : (
          data.components.map((c, i) => <BlameRow key={i} data={c} />)
        )}
      </div>
    </div>
  );
};

export default ProductBlame;
