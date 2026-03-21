import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ClipboardList,
  GitPullRequest, BarChart2, Settings,
  ChevronDown, ChevronRight, Database
} from 'lucide-react';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user } = useAuth();
  const role = user?.role;
  
  const [masterDataExpanded, setMasterDataExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            style={{
              position: 'fixed', inset: 0, backgroundColor: '#000',
              zIndex: 1040, cursor: 'pointer'
            }}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        className="sidebar master-menu-drawer"
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed', left: 0, top: '60px', bottom: 0,
          width: '260px', zIndex: 1050,
          backgroundColor: 'var(--surface-color)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          overflowY: 'auto'
        }}
      >
        <div style={{ padding: '20px' }}>
          
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            {/* Engineering Change Orders */}
            {role !== 'OPERATIONS_USER' && (
              <NavLink to="/ecos" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <GitPullRequest size={18} />
                <span>Engineering Change Orders</span>
              </NavLink>
            )}

            {/* Master Data (Expandable) */}
            <div 
              className="sidebar-nav-item" 
              onClick={() => setMasterDataExpanded(!masterDataExpanded)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={18} />
                <span>Master Data</span>
              </div>
              {masterDataExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
            
            <AnimatePresence>
              {masterDataExpanded && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  style={{ overflow: 'hidden', paddingLeft: '30px' }}
                >
                  <NavLink to="/boms" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                    <ClipboardList size={16} />
                    <span style={{ fontSize: '0.9rem' }}>Bill of Materials</span>
                  </NavLink>
                  <NavLink to="/products" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                    <Package size={16} />
                    <span style={{ fontSize: '0.9rem' }}>Products</span>
                  </NavLink>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reporting */}
            {(role === 'ADMIN' || role === 'APPROVER' || role === 'ENGINEERING_USER') && (
              <NavLink to="/reports" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
                <BarChart2 size={18} />
                <span>Reporting</span>
              </NavLink>
            )}

            {/* Settings (Expandable for Admins) */}
            {role === 'ADMIN' && (
              <>
                <div 
                  className="sidebar-nav-item" 
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  style={{ cursor: 'pointer', justifyContent: 'space-between', marginTop: '12px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={18} />
                    <span>Settings</span>
                  </div>
                  {settingsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                <AnimatePresence>
                  {settingsExpanded && (
                    <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  style={{ overflow: 'hidden', paddingLeft: '12px', marginLeft: '14px', borderLeft: '1.5px solid var(--border-light)' }}
                >
                  <NavLink to="/settings?tab=stages" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive && window.location.search.includes('tab=stages') ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                    <span style={{ fontSize: '0.88rem' }}>ECO's Stages</span>
                  </NavLink>
                  <NavLink to="/settings?tab=approvals" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive && window.location.search.includes('tab=approvals') ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                    <span style={{ fontSize: '0.88rem' }}>Approvals</span>
                  </NavLink>
                </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

          </nav>
        </div>
      </motion.aside>
    </>
  );
}
