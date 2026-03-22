import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

// Common Components
import TopNavBar from './components/TopNavBar';

// Auth & Base Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/Landing/LandingPage';
import Profile      from './pages/Profile/Profile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword  from './pages/ResetPassword';

// Product Pages
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import ProductDetail from './pages/Products/ProductDetail';
import ProductHistory from './pages/Products/ProductHistory';
import ProductCompare from './pages/Products/ProductCompare';
import ProductBlame from './pages/Products/ProductBlame';
import ProductRollback from './pages/Products/ProductRollback';

// BOM Pages
import BOMList from './pages/BOM/BOMList';
import BOMForm from './pages/BOM/BOMForm';
import BOMDetail from './pages/BOM/BOMDetail';
import BOMHistory from './pages/BOM/BOMHistory';
import BOMCompare from './pages/BOM/BOMCompare';
import BOMBlame from './pages/BOM/BOMBlame';
import BOMRollback from './pages/BOM/BOMRollback';

// ECO Pages
import ECOList from './pages/ECO/ECOList';
import ECOForm from './pages/ECO/ECOForm';
import ECODetail from './pages/ECO/ECODetail';
import ECODraftProduct from './pages/ECO/ECODraftProduct';
import ECODraftBOM from './pages/ECO/ECODraftBOM';

// Misc Pages
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import AuditPage from './pages/Audit/AuditPage';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px' }}>
      <TopNavBar isSidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-main-wrapper" style={{ display: 'flex', flex: 1, position: 'relative', backgroundColor: 'var(--bg-page)' }}>
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        <div className="app-main" style={{ 
          flex: 1, 
          padding: '24px', 
          marginLeft: sidebarOpen ? 'var(--sidebar-w)' : '0',
          width: sidebarOpen ? 'calc(100% - var(--sidebar-w))' : '100%',
          maxWidth: sidebarOpen ? 'calc(100vw - var(--sidebar-w))' : '100vw',
          transition: 'all 0.3s var(--ease)',
          overflowX: 'auto'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"                element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login"           element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/register"        element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password"  element={<PageTransition><ResetPassword /></PageTransition>} />

        <Route path="/*" element={
          <PrivateRoute>
            <AppLayout>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="dashboard"     element={<PageTransition><Dashboard /></PageTransition>} />
                  <Route path="profile"       element={<PageTransition><Profile /></PageTransition>} />

                  <Route path="products"      element={<PageTransition><ProductList /></PageTransition>} />
                  <Route path="products/new"  element={<PageTransition><ProductForm /></PageTransition>} />
                  <Route path="products/:id/edit" element={<PageTransition><ProductForm /></PageTransition>} />
                  <Route path="products/:id"  element={<PageTransition><ProductDetail /></PageTransition>} />
                  <Route path="products/:id/history"  element={<PageTransition><ProductHistory /></PageTransition>} />
                  <Route path="products/:id/compare"  element={<PageTransition><ProductCompare /></PageTransition>} />
                  <Route path="products/:id/blame"    element={<PageTransition><ProductBlame /></PageTransition>} />
                  <Route path="products/:id/rollback" element={<PageTransition><ProductRollback /></PageTransition>} />

                  <Route path="boms"          element={<PageTransition><BOMList /></PageTransition>} />
                  <Route path="boms/new"      element={<PageTransition><BOMForm /></PageTransition>} />
                  <Route path="boms/:id/edit" element={<PageTransition><BOMForm /></PageTransition>} />
                  <Route path="boms/:id"      element={<PageTransition><BOMDetail /></PageTransition>} />
                  <Route path="boms/:id/history"  element={<PageTransition><BOMHistory /></PageTransition>} />
                  <Route path="boms/:id/compare"  element={<PageTransition><BOMCompare /></PageTransition>} />
                  <Route path="boms/:id/blame"    element={<PageTransition><BOMBlame /></PageTransition>} />
                  <Route path="boms/:id/rollback" element={<PageTransition><BOMRollback /></PageTransition>} />

                  <Route path="ecos"          element={<PageTransition><ECOList /></PageTransition>} />
                  <Route path="ecos/new"      element={<PageTransition><ECOForm /></PageTransition>} />
                  <Route path="ecos/:id"      element={<PageTransition><ECODetail /></PageTransition>} />
                  <Route path="ecos/:id/edit-product" element={<PageTransition><ECODraftProduct /></PageTransition>} />
                  <Route path="ecos/:id/edit-bom"     element={<PageTransition><ECODraftBOM /></PageTransition>} />

                  <Route path="reports"       element={<PageTransition><ReportsPage /></PageTransition>} />
                  <Route path="settings"      element={<PageTransition><SettingsPage /></PageTransition>} />
                  <Route path="audit"         element={<PageTransition><AuditPage /></PageTransition>} />

                  <Route path="/"              element={<Navigate to="/dashboard" replace />} />
                  <Route path="*"              element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AnimatePresence>
            </AppLayout>
          </PrivateRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  return (
    <Router>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
