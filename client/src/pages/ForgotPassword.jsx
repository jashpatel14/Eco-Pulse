import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, GitBranch, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const FEATURES = [
  { icon: <GitBranch size={18} />, text: 'Full ECO lifecycle — Draft to Applied' },
  { icon: <BarChart3 size={18} />, text: 'Real-time dashboard analytics' },
  { icon: <ShieldCheck size={18} />, text: 'Role-based access control built-in' },
  { icon: <Zap size={18} />, text: 'Automated version control for BOMs' },
];

const S = {
  page: { minHeight: '100vh', display: 'flex', background: '#0f0a1a', fontFamily: "'Inter', system-ui, sans-serif" },
  panel: { width: '480px', minWidth: '480px', background: 'linear-gradient(145deg, #1a0f2e 0%, #0d1333 60%, #0a1628 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.07)' },
  formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fafbff' },
  label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' },
  input: { width: '100%', height: '46px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
};

export default function ForgotPassword() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return addToast('Please enter your email.', 'error');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Something went wrong.', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      {/* ─── Left Branding Panel ─── */}
      <div style={S.panel}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: 'white', boxShadow: '0 8px 20px rgba(139,92,246,0.4)' }}>EP</div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoPulse</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginLeft: '56px', fontWeight: 500 }}>Product Lifecycle Management</p>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          Secure<br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>account</span><br />
          recovery.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '40px' }}>
          We'll send a secure time-limited reset link to your registered email. Your data is always safe with us.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}>{f.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '8px 14px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>All systems operational</span>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div style={S.formSide}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ width: '100%', maxWidth: '420px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {sent ? 'Check your inbox' : 'Forgot your password?'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {sent ? `A reset link was sent to ${email}` : "No worries — we'll send you a reset link instantly."}
            </p>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '76px', height: '76px', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle2 size={36} color="#22c55e" />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7, marginBottom: '28px' }}>
                The link expires in <strong style={{ color: '#1e293b' }}>1 hour</strong>. Check your spam or junk folder if you don't see it in your inbox.
              </p>
              <button onClick={() => setSent(false)} style={{ width: '100%', height: '46px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                Send another link
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={S.label}>Registered Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" required placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} style={S.input} />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', height: '50px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: 'white', boxShadow: loading ? 'none' : '0 8px 20px rgba(139,92,246,0.35)', transition: 'all 0.2s' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#8b5cf6', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
