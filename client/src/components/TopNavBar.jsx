import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Search, User, LogOut } from 'lucide-react';

export default function TopNavBar({ toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [searchVal, setSearchVal] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  // Derive Page Title & New Button Route based on current location
  let pageTitle = '';
  let newRoute = '';

  if (location.pathname.startsWith('/ecos')) {
    pageTitle = "Engineering Change Orders (ECO's)";
    newRoute = '/ecos/new';
  } else if (location.pathname.startsWith('/boms')) {
    pageTitle = "Bill of Materials (BOM's)";
    newRoute = '/boms/new';
  } else if (location.pathname.startsWith('/products')) {
    pageTitle = "Products";
    newRoute = '/products/new';
  } else if (location.pathname.startsWith('/reports')) {
    pageTitle = "Reporting";
  } else if (location.pathname.startsWith('/settings/stages')) {
    pageTitle = "Setting Sub Menu Items \u2192 ECO's Stages";
  } else if (location.pathname.startsWith('/settings/approvals')) {
    pageTitle = "Approvals";
  } else if (location.pathname.startsWith('/settings')) {
    pageTitle = "Settings";
  } else if (location.pathname.startsWith('/dashboard')) {
    pageTitle = "Dashboard";
  } else {
    pageTitle = "Eco-Pulse PLM";
  }

  const isAdmin = user?.role === 'ADMIN';
  const isEngineer = user?.role === 'ENGINEERING_USER';
  
  let showNewButton = false;
  if (location.pathname === '/ecos' && (isAdmin || isEngineer)) showNewButton = true;
  if (location.pathname === '/products' && isAdmin) showNewButton = true;
  if (location.pathname === '/boms' && isAdmin) showNewButton = true;

  const handleSearch = (e) => {
    setSearchVal(e.target.value);
    // Dispatch a custom event so the current sub-page can listen to the global search
    window.dispatchEvent(new CustomEvent('topNavSearch', { detail: e.target.value }));
  };

  const handleNew = () => {
    if (newRoute) navigate(newRoute);
  };

  return (
    <div className="top-navbar" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '60px',
      backgroundColor: 'var(--surface-color, #ffffff)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      
      {/* LEFT: Hamburger & Title */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '300px' }}>
        <button onClick={toggleSidebar} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '8px', marginRight: '16px', display: 'flex', alignItems: 'center'
        }}>
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>{pageTitle}</h1>
      </div>

      {/* CENTER: Search Bar */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {['/ecos', '/boms', '/products'].some(path => location.pathname === path) && (
          <div className="search-input-wrapper" style={{
            position: 'relative', width: '400px', maxWidth: '100%'
          }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input 
              type="text" 
              placeholder={
                location.pathname.startsWith('/ecos') ? "Search by Name, ECO Type, Product..." :
                location.pathname.startsWith('/boms') ? "Search by Finished Product..." :
                location.pathname.startsWith('/products') ? "Search by Product Name..." : "Search..."
              } 
              value={searchVal}
              onChange={handleSearch}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                outline: 'none',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-page)'
              }}
            />
          </div>
        )}
      </div>

      {/* RIGHT: New Button & Profile Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: '200px', justifyContent: 'flex-end' }}>
        {showNewButton && (
          <button onClick={handleNew} style={{
            backgroundColor: '#ed8080',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            New
          </button>
        )}

        {/* Profile Avatar / Trigger */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '1px solid #ccc'
            }}
          >
            <User size={20} color="#555" />
          </div>

          {profileOpen && (
            <div
              style={{
                position: 'absolute', top: '50px', right: '0',
                width: '250px', backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderRadius: '8px', padding: '16px', zIndex: 1001
              }}
            >
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: '12px', marginBottom: '12px' }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{user?.name || 'User'}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#ed8080', fontWeight: 'bold' }}>{user?.role?.replace('_', ' ')}</p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{user?.email || ''}</p>
              </div>
              <button 
                onClick={() => { setProfileOpen(false); navigate('/profile'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'transparent', border: 'none',
                  color: '#333', fontWeight: 500, cursor: 'pointer', width: '100%', marginBottom: '12px'
                }}
              >
                <User size={16} /> My Profile
              </button>
              <button 
                onClick={() => { setProfileOpen(false); logout(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'transparent', border: 'none',
                  color: '#d32f2f', fontWeight: 500, cursor: 'pointer', width: '100%'
                }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
