import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ClipboardList,
  GitPullRequest, BarChart2, Settings, Shield,
  Search, LogOut, User, Bell, ChevronDown, X
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';

const MAIN_ITEMS = [
  { label: 'Dashboard',          path: '/dashboard', icon: LayoutDashboard, roles: null },
  { label: 'Products',           path: '/products',  icon: Package,         roles: null },
  { label: 'Bills of Materials', path: '/boms',      icon: ClipboardList,   roles: null },
  { label: 'ECOs',               path: '/ecos',      icon: GitPullRequest,  roles: ['ENGINEERING_USER','APPROVER','ADMIN'] },
  { label: 'Reports',            path: '/reports',   icon: BarChart2,       roles: null },
  { label: 'My Profile',         path: '/profile',   icon: User,            roles: null },
];

const ADMIN_ITEMS = [
  { label: 'Settings',  path: '/settings', icon: Settings, roles: ['ADMIN'] },
  { label: 'Audit Log', path: '/audit',    icon: Shield,   roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;
  const [search, setSearch] = useState('');

  const filter = items =>
    items
      .filter(i => !i.roles || i.roles.includes(role))
      .filter(i => !search || i.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className="sidebar">
      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <span style={{ fontSize: '1.3rem' }}>⚡</span>
        <span className="sidebar-brand-name">EcoPulse</span>
        <div style={{ marginLeft: 'auto' }}>
          <NotificationPanel />
        </div>
      </div>

      {/* ── Search ── */}
      <div className="sidebar-search">
        <Search size={13} style={{ flexShrink: 0 }} />
        <input
          placeholder="Search menu…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',padding:0 }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Main Nav ── */}
      <p className="sidebar-section-label">Menu</p>
      <nav className="sidebar-nav">
        {filter(MAIN_ITEMS).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={17} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.span layoutId="sidebar-active-pill" className="sidebar-indicator" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Admin Nav ── */}
      {filter(ADMIN_ITEMS).length > 0 && (
        <>
          <p className="sidebar-section-label" style={{ marginTop: 12 }}>Admin</p>
          <nav className="sidebar-nav" style={{ flex: 'none' }}>
            {filter(ADMIN_ITEMS).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={17} />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.span layoutId={`sidebar-admin-${item.path}`} className="sidebar-indicator" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </>
      )}

      {/* ── Spacer ── */}
      <div style={{ flex: 1 }} />

      {/* ── User Pill ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user-pill" onClick={() => navigate('/profile')}>
          <div className="sidebar-avatar">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'User'}</span>
            <span className="sidebar-user-role">{role?.replace(/_/g, ' ')}</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); logout(); }}
            title="Logout"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '4px', borderRadius: '6px',
              transition: 'all 0.15s', marginLeft: 'auto', display: 'flex'
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
