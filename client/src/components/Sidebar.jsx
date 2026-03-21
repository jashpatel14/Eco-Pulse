import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      {isOpen && (
        <div 
          onClick={closeSidebar}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040, cursor: 'pointer'
          }}
        />
      )}

      <aside 
        className={`sidebar master-menu-drawer ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed', left: 0, top: 0, bottom: 0,
          width: '260px', zIndex: 1050,
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'all 0.3s var(--ease)'
        }}
      >
        <div style={{ padding: '0 20px 20px' }}>
          {/* Logo / Branding Area */}
          <div style={{ 
            height: '60px', 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '10px',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: 'var(--brand)',
              margin: 0,
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <img src="/logo.png" alt="EcoPulse" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
              EcoPulse
            </h2>
          </div>
          
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
            
            {masterDataExpanded && (
              <div style={{ paddingLeft: '30px' }}>
                <NavLink to="/boms" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                  <ClipboardList size={16} />
                  <span style={{ fontSize: '0.9rem' }}>Bill of Materials</span>
                </NavLink>
                <NavLink to="/products" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                  <Package size={16} />
                  <span style={{ fontSize: '0.9rem' }}>Products</span>
                </NavLink>
              </div>
            )}

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

                {settingsExpanded && (
                  <div style={{ paddingLeft: '12px', marginLeft: '14px', borderLeft: '1.5px solid var(--border-light)' }}>
                    <NavLink to="/settings?tab=stages" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive && window.location.search.includes('tab=stages') ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                      <span style={{ fontSize: '0.88rem' }}>ECO's Stages</span>
                    </NavLink>
                    <NavLink to="/settings?tab=approvals" onClick={closeSidebar} className={({ isActive }) => `sidebar-nav-item ${isActive && window.location.search.includes('tab=approvals') ? 'active' : ''}`} style={{ padding: '8px 12px', minHeight: '36px' }}>
                      <span style={{ fontSize: '0.88rem' }}>Approvals</span>
                    </NavLink>
                  </div>
                )}
              </>
            )}

          </nav>
        </div>
      </aside>
    </>
  );
}
