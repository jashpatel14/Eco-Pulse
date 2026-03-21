import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, GitMerge, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../api/api';

const brand = '#ed8080';

const FEATURES = [
  { icon: <GitMerge size={14} />, text: 'Full ECO lifecycle management' },
  { icon: <BarChart3 size={14} />, text: 'Real-time dashboard analytics' },
  { icon: <ShieldCheck size={14} />, text: 'Role-based access control' },
  { icon: <Zap size={14} />, text: 'BOM version history & audit logs' },
];

function BrandPanel({ title, description }) {
  return (
    <div style={{
      width: '400px', minWidth: '400px', display: 'flex', flexDirection: 'column',
      padding: '48px 44px', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(160deg, #2d1515 0%, #1a0a0a 60%, #1e1010 100%)',
    }}>
      <div style={{ position: 'absolute', top: '-120px', left: '-120px', width: '380px', height: '380px', background: `radial-gradient(circle, ${brand}20 0%, transparent 60%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '280px', height: '280px', background: `radial-gradient(circle, ${brand}12 0%, transparent 60%)`, borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '11px', marginBottom: '52px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: 'white', boxShadow: `0 4px 16px ${brand}50`, flexShrink: 0 }}>EP</div>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>EcoPulse</div>
          <div style={{ fontSize: '0.67rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Product Lifecycle Management</div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', lineHeight: 1.25, letterSpacing: '-0.03em', margin: '0 0 12px' }}>
          {title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 36px' }}>
          {description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '100px', padding: '6px 12px',
              color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem', fontWeight: 500,
            }}>
              <span style={{ color: brand, display: 'flex' }}>{f.icon}</span>
              {f.text}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', fontWeight: 500 }}>All systems operational</span>
      </div>
    </div>
  );
}

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

  const labelProps = { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' };
  const inputStyle = { width: '100%', height: '46px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <BrandPanel 
        title={<>Secure <span style={{ color: brand }}>account</span> recovery.</>}
        description="The PLM platform built for modern engineering teams — track, approve and ship product changes with confidence."
      />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fafbff' }}>
        <motion.div initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {sent ? 'Check your inbox' : 'Forgot your password?'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {sent ? `Reset link sent to ${email}` : "No worries — we'll send you a reset link instantly."}
            </p>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle2 size={30} color="#22c55e" />
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7, marginBottom: '24px' }}>
                The link expires in <strong style={{ color: '#1e293b' }}>1 hour</strong>. Check your spam folder if you don't see it.
              </p>
              <button onClick={() => setSent(false)} style={{ width: '100%', height: '46px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}>
                Send another link
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={labelProps}>Registered Email</label>
                <div style={{ position: 'relative' }}>
                  <input type="email" required placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ width: '100%', height: '50px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', background: loading ? '#f0a0a0' : brand, color: 'white', boxShadow: loading ? 'none' : `0 6px 20px ${brand}50`, transition: 'all 0.2s' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '28px', textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: brand, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
