import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Hash, User, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { addToast('Enter a valid email address.', 'error'); return false; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/.test(password)) { addToast('Password must be 8+ chars with uppercase, lowercase & special char.', 'error'); return false; }
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

  const brand = '#ed8080';
  const brandDark = '#d96b6b';

  const S = {
    page: { minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" },
    panel: {
      width: '420px', minWidth: '420px', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', padding: '56px 48px', position: 'relative', overflow: 'hidden',
      background: `linear-gradient(160deg, #2d1515 0%, #1a0a0a 50%, #1e1010 100%)`,
    },
    formSide: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', background: '#fafbff' },
    label: { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '7px' },
    input: { width: '100%', height: '46px', padding: '0 14px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' },
    select: { width: '100%', height: '46px', padding: '0 36px 0 42px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.925rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', appearance: 'none', cursor: 'pointer', fontFamily: 'inherit' },
  };

  return (
    <div style={S.page}>
      {/* ─── Left Brand Panel ─── */}
      <div style={S.panel}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '350px', height: '350px', background: `radial-gradient(circle, ${brand}22 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', right: '-80px', width: '280px', height: '280px', background: `radial-gradient(circle, ${brand}15 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '15px', color: 'white', boxShadow: `0 6px 18px ${brand}55`, flexShrink: 0 }}>EP</div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>EcoPulse</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>Product Lifecycle Management</div>
          </div>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: '16px' }}>
          Engineering<br />
          <span style={{ color: brand }}>change</span> at<br />
          every stage.
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '40px' }}>
          The PLM platform built for modern engineering teams — track, approve and ship product changes with confidence.
        </p>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', marginBottom: '28px' }} />

        {/* Key points — simple, clean */}
        {[
          'Full ECO lifecycle management',
          'Real-time dashboard analytics',
          'Role-based access control',
          'BOM version history & audit logs',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: brand, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 500 }}>{item}</span>
          </div>
        ))}

        {/* Status dot at bottom */}
        <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px', padding: '7px 14px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.74rem', fontWeight: 600 }}>All systems operational</span>
          </div>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div style={S.formSide}>
        <motion.div style={{ width: '100%', maxWidth: '440px' }} key={isRegister ? 'register' : 'login'} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28 }}>

          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {isRegister ? 'Create your account' : 'Sign in to EcoPulse'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {isRegister ? 'Join your team on the PLM platform.' : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

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
                      <path d="M1 1L5 5L9 1" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label style={S.label}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input name="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required style={S.input} />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '14px' }}>
              <div>
                <label style={S.label}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ ...S.input, paddingRight: '42px' }} />
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
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

            {!isRegister && (
              <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: brand, fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', height: '50px', borderRadius: '12px', border: 'none', fontWeight: 700,
              fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: loading ? '#f0a0a0' : brand,
              color: 'white',
              boxShadow: loading ? 'none' : `0 8px 22px ${brand}55`,
              marginTop: '4px'
            }}>
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={16} />}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button type="button" onClick={() => navigate(isRegister ? '/login' : '/register')} style={{ background: 'none', border: 'none', color: brand, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', padding: 0, fontFamily: 'inherit' }}>
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
