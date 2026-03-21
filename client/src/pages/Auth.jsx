import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Hash, User, ShieldCheck, ArrowRight, Zap, GitBranch, BarChart3, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const FEATURES = [
  { icon: <GitBranch size={18} />, text: 'Full ECO lifecycle — Draft to Applied' },
  { icon: <BarChart3 size={18} />, text: 'Real-time dashboard analytics' },
  { icon: <ShieldCheck size={18} />, text: 'Role-based access control built-in' },
  { icon: <Zap size={18} />, text: 'Automated version control for BOMs' },
];

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ loginId: '', email: '', password: '', rePassword: '', role: 'ENGINEERING_USER' });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    setIsRegister(window.location.pathname === '/register');
  }, [window.location.pathname, isAuthenticated]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateSignup = () => {
    const { loginId, email, password, rePassword } = formData;
    if (loginId.length < 6 || loginId.length > 12) { addToast('Login ID must be 6–12 characters.', 'error'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { addToast('Enter a valid email address.', 'error'); return false; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) { addToast('Password must be 8+ chars with uppercase, lowercase & special char.', 'error'); return false; }
    if (password !== rePassword) { addToast('Passwords do not match.', 'error'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (isRegister) {
      if (!validateSignup()) return;
      setLoading(true);
      try {
        const res = await register({ loginId: formData.loginId, email: formData.email, password: formData.password, role: formData.role });
        addToast(res.message, 'success');
        navigate('/login');
      } catch (err) { addToast(err.response?.data?.message || 'Registration failed', 'error'); }
      finally { setLoading(false); }
    } else {
      if (!formData.loginId || !formData.password) return addToast('Please fill all fields', 'error');
      setLoading(true);
      try {
        await login(formData.loginId, formData.password);
        addToast('Welcome back!', 'success');
        navigate('/dashboard');
      } catch (err) { addToast(err.response?.data?.message || 'Invalid credentials', 'error'); }
      finally { setLoading(false); }
    }
  };

  const S = {
    page: { minHeight: '100vh', display: 'flex', background: '#0f0a1a', fontFamily: "'Inter', system-ui, sans-serif" },
    panel: { width: '480px', minWidth: '480px', background: 'linear-gradient(145deg, #1a0f2e 0%, #0d1333 60%, #0a1628 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 56px', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(255,255,255,0.07)' },
    formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fafbff' },
    formBox: { width: '100%', maxWidth: '440px' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' },
    input: { width: '100%', height: '46px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'inherit' },
    select: { width: '100%', height: '46px', padding: '0 36px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' },
    submit: { width: '100%', height: '50px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', letterSpacing: '0.3px', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
  };

  return (
    <div style={S.page}>
      {/* ─── Left Branding Panel ─── */}
      <div style={S.panel}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '16px', color: 'white', boxShadow: '0 8px 20px rgba(139,92,246,0.4)' }}>EP</div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoPulse</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginLeft: '56px', fontWeight: 500 }}>Product Lifecycle Management</p>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          Engineering<br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>change</span> at<br />
          every stage.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '40px', maxWidth: '320px' }}>
          The PLM platform built for modern engineering teams — track, approve and ship product changes with confidence.
        </p>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', flexShrink: 0 }}>{f.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{ marginTop: 'auto', paddingTop: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '8px 14px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>All systems operational</span>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div style={S.formSide}>
        <motion.div style={S.formBox} key={isRegister ? 'register' : 'login'} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {isRegister ? 'Create your account' : 'Sign in to EcoPulse'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {isRegister ? 'Join your team on the PLM platform.' : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Login ID + Role (register: side by side) */}
            <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '14px' }}>
              <div>
                <label style={S.label}>Login ID</label>
                <div style={{ position: 'relative' }}>
                  <input name="loginId" placeholder={isRegister ? 'e.g. jash2901' : 'Your login ID'} value={formData.loginId} onChange={handleChange} required style={S.input} />
                  <Hash size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              {isRegister && (
                <div>
                  <label style={S.label}>Project Role</label>
                  <div style={{ position: 'relative' }}>
                    <select name="role" value={formData.role} onChange={handleChange} style={S.select}>
                      <option value="ENGINEERING_USER">Engineer</option>
                      <option value="APPROVER">Approver</option>
                      <option value="OPERATIONS_USER">Operations</option>
                    </select>
                    <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <path d="M1 1L5 5L9 1" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Email (register only) */}
            {isRegister && (
              <div>
                <label style={S.label}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input name="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required style={S.input} />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            )}

            {/* Password + Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '14px' }}>
              <div>
                <label style={S.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ ...S.input, paddingRight: '42px' }} />
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {isRegister && (
                <div>
                  <label style={S.label}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input name="rePassword" type="password" placeholder="••••••••" value={formData.rePassword} onChange={handleChange} required style={S.input} />
                    <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Forgot Password link (login only) */}
            {!isRegister && (
              <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#8b5cf6', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              ...S.submit,
              background: loading ? '#c4b5fd' : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              boxShadow: loading ? 'none' : '0 8px 20px rgba(139,92,246,0.35)',
              marginTop: '4px'
            }}>
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={16} />}
            </button>

            {/* Toggle mode */}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button type="button" onClick={() => navigate(isRegister ? '/login' : '/register')} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', padding: 0, fontFamily: 'inherit' }}>
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
