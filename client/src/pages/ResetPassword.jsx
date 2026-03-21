import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const brand = '#ed8080';

const PanelLeft = () => (
  <div style={{
    width: '420px', minWidth: '420px', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', padding: '56px 48px', position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(160deg, #2d1515 0%, #1a0a0a 50%, #1e1010 100%)',
  }}>
    <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '350px', height: '350px', background: `radial-gradient(circle, ${brand}22 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none' }} />
    <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '280px', height: '280px', background: `radial-gradient(circle, ${brand}15 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none' }} />

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', color: 'white', boxShadow: `0 6px 18px ${brand}55` }}>EP</div>
      <div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoPulse</div>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Product Lifecycle Management</div>
      </div>
    </div>

    <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: '16px' }}>
      Set your<br /><span style={{ color: brand }}>new</span><br />password.
    </h2>
    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '40px' }}>
      Choose a strong, unique password. Your account security is our top priority.
    </p>

    <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '28px' }} />
    {['Full ECO lifecycle management', 'Real-time dashboard analytics', 'Role-based access control', 'BOM version history & audit logs'].map((item, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: brand, flexShrink: 0 }} />
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 500 }}>{item}</span>
      </div>
    ))}

    <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '7px 14px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.74rem', fontWeight: 600 }}>All systems operational</span>
      </div>
    </div>
  </div>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const isValidLink = !!token && !!email;
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return addToast('Passwords do not match.', 'error');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, email: decodeURIComponent(email), newPassword: form.newPassword });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      addToast(err.response?.data?.message || 'Reset failed. The link may have expired.', 'error');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', height: '46px', padding: '0 42px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const label = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <PanelLeft />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fafbff' }}>
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }} style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {done ? 'Password reset!' : 'Create new password'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {done ? 'Redirecting you to login...' : `Account: ${decodeURIComponent(email || '')}`}
            </p>
          </div>

          {!isValidLink && (
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <AlertTriangle size={34} color="#f59e0b" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#92400e', fontSize: '0.9rem', marginBottom: '14px', fontWeight: 500 }}>This reset link is invalid or missing parameters.</p>
              <Link to="/forgot-password" style={{ color: brand, fontWeight: 600 }}>Request a new reset link →</Link>
            </div>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '72px', height: '72px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={34} color="#22c55e" />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7 }}>
                Password reset successfully.<br /><strong style={{ color: '#1e293b' }}>Redirecting to login in 3s...</strong>
              </p>
            </motion.div>
          )}

          {isValidLink && !done && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={label}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} style={inputStyle} />
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={label}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" required placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={inputStyle} />
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '-6px' }}>8+ chars · uppercase · lowercase · special char (!@#$%^&*)</p>
              <button type="submit" disabled={loading} style={{ width: '100%', height: '50px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', background: loading ? '#f0a0a0' : brand, color: 'white', boxShadow: loading ? 'none' : `0 8px 22px ${brand}55`, transition: 'all 0.2s', marginTop: '4px' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {!done && (
            <div style={{ marginTop: '28px', textAlign: 'center' }}>
              <Link to="/login" style={{ color: brand, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>Back to Sign In</Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
