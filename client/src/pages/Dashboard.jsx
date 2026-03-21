import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ClipboardList, GitPullRequest, BarChart2, CheckCircle, AlertCircle, Clock, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const [stats, setStats] = useState({
    products: 0, boms: 0, ecos_total: 0,
    ecos_draft: 0, ecos_in_review: 0, ecos_applied: 0, ecos_rejected: 0
  });

  useEffect(() => {
    Promise.all([
      api.get('/products').catch(() => ({ data: [] })),
      api.get('/boms').catch(() => ({ data: [] })),
      api.get('/ecos').catch(() => ({ data: [] })),
    ]).then(([prods, boms, ecos]) => {
      const ecoData = ecos.data;
      setStats({
        products: prods.data.length,
        boms: boms.data.length,
        ecos_total: ecoData.length,
        ecos_draft: ecoData.filter(e => e.status === 'DRAFT').length,
        ecos_in_review: ecoData.filter(e => e.status === 'IN_REVIEW').length,
        ecos_applied: ecoData.filter(e => e.status === 'APPLIED').length,
        ecos_rejected: ecoData.filter(e => e.status === 'REJECTED').length,
      });
    });
  }, []);

  const CARD_SETS = {
    ENGINEERING_USER: [
      { icon: Package, label: 'Active Products', value: stats.products, cls: 'stat-blue', nav: '/products' },
      { icon: ClipboardList, label: 'Bills of Materials', value: stats.boms, cls: 'stat-purple', nav: '/boms' },
      { icon: Clock, label: 'Draft ECOs', value: stats.ecos_draft, cls: 'stat-amber', nav: '/ecos' },
      { icon: GitPullRequest, label: 'In Review', value: stats.ecos_in_review, cls: 'stat-blue', nav: '/ecos' },
      { icon: CheckCircle, label: 'Applied ECOs', value: stats.ecos_applied, cls: 'stat-green', nav: '/ecos' },
      { icon: AlertCircle, label: 'Rejected ECOs', value: stats.ecos_rejected, cls: 'stat-red', nav: '/ecos' },
    ],
    APPROVER: [
      { icon: GitPullRequest, label: 'Awaiting Approval', value: stats.ecos_in_review, cls: 'stat-amber', nav: '/ecos' },
      { icon: CheckCircle, label: 'Applied ECOs', value: stats.ecos_applied, cls: 'stat-green', nav: '/ecos' },
      { icon: AlertCircle, label: 'Rejected ECOs', value: stats.ecos_rejected, cls: 'stat-red', nav: '/ecos' },
      { icon: Package, label: 'Active Products', value: stats.products, cls: 'stat-blue', nav: '/products' },
    ],
    OPERATIONS_USER: [
      { icon: Package, label: 'Active Products', value: stats.products, cls: 'stat-blue', nav: '/products' },
      { icon: ClipboardList, label: 'Bills of Materials', value: stats.boms, cls: 'stat-purple', nav: '/boms' },
      { icon: CheckCircle, label: 'Applied ECOs', value: stats.ecos_applied, cls: 'stat-green', nav: '/ecos' },
    ],
    ADMIN: [
      { icon: Package, label: 'Products', value: stats.products, cls: 'stat-blue', nav: '/products' },
      { icon: ClipboardList, label: 'BOMs', value: stats.boms, cls: 'stat-purple', nav: '/boms' },
      { icon: GitPullRequest, label: 'Total ECOs', value: stats.ecos_total, cls: 'stat-amber', nav: '/ecos' },
      { icon: Clock, label: 'In Review', value: stats.ecos_in_review, cls: 'stat-blue', nav: '/ecos' },
      { icon: CheckCircle, label: 'Applied', value: stats.ecos_applied, cls: 'stat-green', nav: '/ecos' },
      { icon: AlertCircle, label: 'Rejected', value: stats.ecos_rejected, cls: 'stat-red', nav: '/ecos' },
    ],
    USER: [
      { icon: Package, label: 'Products', value: stats.products, cls: 'stat-blue', nav: '/products' },
      { icon: ClipboardList, label: 'BOMs', value: stats.boms, cls: 'stat-purple', nav: '/boms' },
    ],
  };

  const cards = CARD_SETS[role] || CARD_SETS['USER'];

  const QUICK_ACTIONS = [
    { label: 'New Product', onClick: () => navigate('/products/new'), roles: ['ENGINEERING_USER','ADMIN'], primary: true },
    { label: 'New BOM', onClick: () => navigate('/boms/new'), roles: ['ENGINEERING_USER','ADMIN'], primary: true },
    { label: 'New ECO', onClick: () => navigate('/ecos/new'), roles: ['ENGINEERING_USER','ADMIN'], primary: true },
    { label: 'View Reports', onClick: () => navigate('/reports'), roles: null, primary: false },
    { label: 'Manage Settings', onClick: () => navigate('/settings'), roles: ['ADMIN'], primary: false },
    { label: 'Audit Log', onClick: () => navigate('/audit'), roles: ['ADMIN'], primary: false },
  ].filter(a => !a.roles || a.roles.includes(role));

  return (
    <div className="plm-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">
            Good day, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="page-desc">
            Here's an overview of your EcoPulse PLM workspace
          </p>
        </div>
        <span style={{
          background: 'var(--brand-soft)', color: 'var(--brand-primary)',
          border: '1px solid #c7d2fe', borderRadius: 999,
          padding: '4px 14px', fontSize: '0.78rem', fontWeight: 700
        }}>
          {role?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Stat cards */}
      <motion.div
        className="stat-grid"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            className={`stat-card ${card.cls}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => navigate(card.nav)}
          >
            <div className="stat-icon-wrap">
              <card.icon size={20} />
            </div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions + Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
        {/* Quick Actions */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Zap size={18} style={{ color: 'var(--brand-primary)' }} />
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            {QUICK_ACTIONS.map(a => (
              <button key={a.label} className={a.primary ? 'btn-plm btn-sm' : 'btn-outline btn-sm'} onClick={a.onClick}>
                {a.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Summary card */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <TrendingUp size={18} style={{ color: '#059669' }} />
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>ECO Pipeline</h3>
          </div>
          {[
            { label: 'Draft', value: stats.ecos_draft, color: '#d97706', pct: stats.ecos_total ? Math.round(stats.ecos_draft / stats.ecos_total * 100) : 0 },
            { label: 'In Review', value: stats.ecos_in_review, color: '#2563eb', pct: stats.ecos_total ? Math.round(stats.ecos_in_review / stats.ecos_total * 100) : 0 },
            { label: 'Applied', value: stats.ecos_applied, color: '#059669', pct: stats.ecos_total ? Math.round(stats.ecos_applied / stats.ecos_total * 100) : 0 },
            { label: 'Rejected', value: stats.ecos_rejected, color: '#e11d48', pct: stats.ecos_total ? Math.round(stats.ecos_rejected / stats.ecos_total * 100) : 0 },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:4 }}>
                <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
              </div>
              <div style={{ height: 6, background: '#f3f4f6', borderRadius: 999 }}>
                <div style={{ height: 6, background: item.color, borderRadius: 999, width: `${item.pct}%`, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          ))}
          <button className="btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => navigate('/ecos')}>
            View all ECOs <ArrowRight size={13} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
