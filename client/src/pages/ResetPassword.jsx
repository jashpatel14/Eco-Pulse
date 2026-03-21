import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle2, AlertTriangle, GitMerge, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const brand = 'var(--brand)';

const FEATURES = [
  { icon: <GitMerge size={14} />, text: 'Full ECO lifecycle management' },
  { icon: <BarChart3 size={14} />, text: 'Real-time dashboard analytics' },
  { icon: <ShieldCheck size={14} />, text: 'Role-based access control' },
  { icon: <Zap size={14} />, text: 'BOM version history & audit logs' },
];

function BrandPanel({ title, description }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      padding: '64px 60px', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #2d1515 0%, #1a0a0a 60%, #1e1010 100%)',
    }}>
      <div style={{ position: 'absolute', top: '-150px', left: '-150px', width: '500px', height: '500px', background: `radial-gradient(circle, ${brand}20 0%, transparent 60%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '400px', height: '400px', background: `radial-gradient(circle, ${brand}12 0%, transparent 60%)`, borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', color: 'white', boxShadow: `0 4px 16px ${brand}50`, flexShrink: 0 }}>EP</div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>EcoPulse</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Product Lifecycle Management</div>
        </div>
      </div>

      <div style={{ marginBottom: 'auto', paddingTop: '40px', paddingBottom: '40px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
          {title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 48px', maxWidth: '440px' }}>
          {description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px', padding: '8px 16px',
              color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', fontWeight: 500,
            }}>
              <span style={{ color: brand, display: 'flex' }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 7px #22c55e', flexShrink: 0 }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontWeight: 600 }}>All systems operational</span>
      </div>
    </div>
  );
}

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

  const inputStyle = { width: '100%', height: '50px', padding: '0 44px 0 44px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '8px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <BrandPanel 
        title={<>Set your <span style={{ color: brand }}>new</span> password.</>}
        description="Choose a strong, unique password. Your account security is our top priority."
      />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', background: '#fafbff' }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '8px' }}>
              {done ? 'Password reset!' : 'Create new password'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              {done ? 'Redirecting you to login...' : `Account: ${decodeURIComponent(email || '')}`}
            </p>
          </div>

          {!isValidLink && (
            <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '32px', textAlign: 'center' }}>
              <AlertTriangle size={36} color="#f59e0b" style={{ margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: '#92400e', fontSize: '1rem', marginBottom: '16px', fontWeight: 600 }}>This reset link is invalid or missing parameters.</p>
              <Link to="/forgot-password" style={{ color: brand, fontWeight: 700 }}>Request a new reset link →</Link>
            </div>
          )}

          {done && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '72px', height: '72px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={32} color="#22c55e" />
              </div>
              <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.75 }}>
                Password reset successfully.<br /><strong style={{ color: '#1e293b' }}>Redirecting to login in 3s...</strong>
              </p>
            </motion.div>
          )}

          {isValidLink && !done && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} required placeholder="••••••••" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} style={inputStyle} />
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input type="password" required placeholder="••••••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} style={inputStyle} />
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '-6px' }}>8+ chars · uppercase · lowercase · special char (!@#$%^&*)</p>
              <button type="submit" disabled={loading} style={{ width: '100%', height: '54px', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', background: loading ? '#f0a0a0' : brand, color: 'white', boxShadow: loading ? 'none' : `0 8px 24px ${brand}50`, transition: 'all 0.2s', marginTop: '4px' }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {!done && (
              <BackButton to="/login" label="Back to Sign In" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
