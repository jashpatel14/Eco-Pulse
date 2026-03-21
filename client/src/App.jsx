import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// PLM Pages
import ProductList   from './pages/Products/ProductList';
import ProductForm   from './pages/Products/ProductForm';
import ProductDetail from './pages/Products/ProductDetail';
import BOMList       from './pages/BOM/BOMList';
import BOMForm       from './pages/BOM/BOMForm';
import BOMDetail     from './pages/BOM/BOMDetail';
import ECOList       from './pages/ECO/ECOList';
import ECOForm       from './pages/ECO/ECOForm';
import ECODetail     from './pages/ECO/ECODetail';
import ECODraftProduct from './pages/ECO/ECODraftProduct';
import ECODraftBOM     from './pages/ECO/ECODraftBOM';
import ReportsPage   from './pages/Reports/ReportsPage';
import SettingsPage  from './pages/Settings/SettingsPage';
import AuditPage     from './pages/Audit/AuditPage';
import ProfilePage   from './pages/Profile/ProfilePage';

// Layout — TopNavBar + Slide-out Sidebar
import TopNavBar from './components/TopNavBar';
import { useState } from 'react';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '60px' }}>
      <TopNavBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-main-wrapper" style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
        <div className="app-main" style={{ 
          flex: 1, 
          padding: '24px', 
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          marginLeft: sidebarOpen ? 'var(--sidebar-w)' : '0'
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
      {/* Public Auth Routes */}
      <Route path="/login"    element={<Auth />} />
      <Route path="/register" element={<Auth />} />

      {/* Protected PLM Routes */}
      <Route path="/*" element={
        <PrivateRoute>
          <AppLayout>
            <Routes>
              <Route path="dashboard"     element={<Dashboard />} />
              <Route path="profile"       element={<ProfilePage />} />

              <Route path="products"      element={<ProductList />} />
              <Route path="products/new"  element={<ProductForm />} />
              <Route path="products/:id"  element={<ProductDetail />} />

              <Route path="boms"          element={<BOMList />} />
              <Route path="boms/new"      element={<BOMForm />} />
              <Route path="boms/:id"      element={<BOMDetail />} />

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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
