import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import { useState } from 'react';

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
  return (
    <Routes>
      <Route path="/"                element={<LandingPage />} />
      <Route path="/login"           element={<Auth />} />
      <Route path="/register"        element={<Auth />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      <Route path="/*" element={
        <PrivateRoute>
          <AppLayout>
            <Routes>
              <Route path="dashboard"     element={<Dashboard />} />
              <Route path="profile"       element={<Profile />} />

              <Route path="products"      element={<ProductList />} />
              <Route path="products/new"  element={<ProductForm />} />
              <Route path="products/:id"  element={<ProductDetail />} />
              <Route path="products/:id/history"  element={<ProductHistory />} />
              <Route path="products/:id/compare"  element={<ProductCompare />} />
              <Route path="products/:id/blame"    element={<ProductBlame />} />
              <Route path="products/:id/rollback" element={<ProductRollback />} />

              <Route path="boms"          element={<BOMList />} />
              <Route path="boms/new"      element={<BOMForm />} />
              <Route path="boms/:id"      element={<BOMDetail />} />
              <Route path="boms/:id/history"  element={<BOMHistory />} />
              <Route path="boms/:id/compare"  element={<BOMCompare />} />
              <Route path="boms/:id/blame"    element={<BOMBlame />} />
              <Route path="boms/:id/rollback" element={<BOMRollback />} />

              <Route path="ecos"          element={<ECOList />} />
              <Route path="ecos/new"      element={<ECOForm />} />
              <Route path="ecos/:id"      element={<ECODetail />} />
              <Route path="ecos/:id/edit-product" element={<ECODraftProduct />} />
              <Route path="ecos/:id/edit-bom"     element={<ECODraftBOM />} />

              <Route path="reports"       element={<ReportsPage />} />
              <Route path="settings"      element={<SettingsPage />} />
              <Route path="audit"         element={<AuditPage />} />

              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="*"              element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </PrivateRoute>
      } />
    </Routes>
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
