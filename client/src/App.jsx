import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import GoogleCallback from './pages/GoogleCallback';

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
import ReportsPage   from './pages/Reports/ReportsPage';
import SettingsPage  from './pages/Settings/SettingsPage';
import AuditPage     from './pages/Audit/AuditPage';
import ProfilePage   from './pages/Profile/ProfilePage';

// Layout — sidebar only, NO top navbar
function AppLayout({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <>{children}</>;
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        {children}
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        {/* Auth (public) */}
        <Route path="/"                     element={<Navigate to="/login" replace />} />
        <Route path="/login"                element={<Auth />} />
        <Route path="/register"             element={<Auth />} />
        <Route path="/verify-email"         element={<VerifyEmail />} />
        <Route path="/forgot-password"      element={<ForgotPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/reset-password"       element={<ResetPassword />} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        <Route path="/products"     element={<PrivateRoute><ProductList /></PrivateRoute>} />
        <Route path="/products/new" element={<PrivateRoute roles={['ENGINEERING_USER','ADMIN']}><ProductForm /></PrivateRoute>} />
        <Route path="/products/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />

        <Route path="/boms"     element={<PrivateRoute><BOMList /></PrivateRoute>} />
        <Route path="/boms/new" element={<PrivateRoute roles={['ENGINEERING_USER','ADMIN']}><BOMForm /></PrivateRoute>} />
        <Route path="/boms/:id" element={<PrivateRoute><BOMDetail /></PrivateRoute>} />

        <Route path="/ecos"     element={<PrivateRoute roles={['ENGINEERING_USER','APPROVER','ADMIN']}><ECOList /></PrivateRoute>} />
        <Route path="/ecos/new" element={<PrivateRoute roles={['ENGINEERING_USER','ADMIN']}><ECOForm /></PrivateRoute>} />
        <Route path="/ecos/:id" element={<PrivateRoute roles={['ENGINEERING_USER','APPROVER','ADMIN']}><ECODetail /></PrivateRoute>} />

        <Route path="/reports"  element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute roles={['ADMIN']}><SettingsPage /></PrivateRoute>} />
        <Route path="/audit"    element={<PrivateRoute roles={['ADMIN']}><AuditPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppLayout>
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
