import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ClipboardList, GitPullRequest, BarChart2, CheckCircle, AlertCircle, Clock, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
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
            Good day, {user?.name || 'User'} 👋
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
        <motion.div 
          className="glass-card" 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
              <Zap size={18} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>Quick Actions</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {QUICK_ACTIONS.map(a => (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={a.label} 
                className={a.primary ? 'btn-plm btn-sm' : 'btn-outline btn-sm'} 
                onClick={a.onClick}
                style={{ justifyContent: 'center' }}
              >
                {a.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Summary card */}
        <motion.div 
          className="glass-card" 
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'hsla(142, 70%, 50%, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
               <TrendingUp size={18} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>ECO Pipeline</h3>
          </div>

          <div style={{ width: '100%', height: 200 }}>
            {stats.ecos_total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Draft', value: stats.ecos_draft, color: '#d97706' },
                      { name: 'In Review', value: stats.ecos_in_review, color: '#2563eb' },
                      { name: 'Applied', value: stats.ecos_applied, color: '#059669' },
                      { name: 'Rejected', value: stats.ecos_rejected, color: '#e11d48' },
                    ].filter(d => d.value > 0)}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {[
                      { name: 'Draft', value: stats.ecos_draft, color: '#d97706' },
                      { name: 'In Review', value: stats.ecos_in_review, color: '#2563eb' },
                      { name: 'Applied', value: stats.ecos_applied, color: '#059669' },
                      { name: 'Rejected', value: stats.ecos_rejected, color: '#e11d48' },
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                No active ECOs yet
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
            {[
              { label: 'Draft', value: stats.ecos_draft, color: '#d97706' },
              { label: 'In Review', value: stats.ecos_in_review, color: '#2563eb' },
              { label: 'Applied', value: stats.ecos_applied, color: '#059669' },
              { label: 'Rejected', value: stats.ecos_rejected, color: '#e11d48' },
            ].map(item => {
              const pct = stats.ecos_total ? Math.round((item.value / stats.ecos_total) * 100) : 0;
              return (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                  <span style={{ color: 'var(--text-dim)' }}>{item.label}:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.value} ({pct}%)</span>
                </div>
              );
            })}
          </div>

          <button className="btn-outline btn-sm" style={{ marginTop: 24, width: '100%' }} onClick={() => navigate('/ecos')}>
            View all ECOs <ArrowRight size={13} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
