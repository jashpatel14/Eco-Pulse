import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Hash, User, ArrowRight, GitMerge, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const brand = '#ed8080';

const FEATURES = [
  { icon: <GitMerge size={14} />, text: 'Full ECO lifecycle management' },
  { icon: <BarChart3 size={14} />, text: 'Real-time dashboard analytics' },
  { icon: <ShieldCheck size={14} />, text: 'Role-based access control' },
  { icon: <Zap size={14} />, text: 'BOM version history & audit logs' },
];

function BrandPanel({ title }) {
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
        {title || (
          <>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', lineHeight: 1.15, letterSpacing: '-0.04em', margin: '0 0 16px' }}>
              Engineering <span style={{ color: brand }}>change</span><br />at every stage.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.7, margin: '0 0 48px', maxWidth: '440px' }}>
              The PLM platform built for modern engineering teams — track, approve and ship product changes with confidence.
            </p>
          </>
        )}

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

  const inputStyle = { width: '100%', height: '50px', padding: '0 14px 0 44px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#ffffff', fontSize: '0.95rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: '8px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <BrandPanel />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', background: '#fafbff' }}>
        <motion.div style={{ width: '100%', maxWidth: '440px' }} key={isRegister ? 'r' : 'l'} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '8px' }}>
              {isRegister ? 'Create your account' : 'Sign in to EcoPulse'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              {isRegister ? 'Join your team on the PLM platform.' : 'Enter your credentials to access your workspace.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Login ID</label>
                <div style={{ position: 'relative' }}>
                  <input name="loginId" placeholder={isRegister ? 'e.g. jash2901' : 'Your login ID'} value={formData.loginId} onChange={handleChange} required style={inputStyle} />
                  <Hash size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
              {isRegister && (
                <div>
                  <label style={labelStyle}>Project Role</label>
                  <div style={{ position: 'relative' }}>
                    <select name="role" value={formData.role} onChange={handleChange} style={{ ...inputStyle, padding: '0 40px 0 44px', appearance: 'none', cursor: 'pointer' }}>
                      <option value="ENGINEERING_USER">Engineer</option>
                      <option value="APPROVER">Approver</option>
                      <option value="OPERATIONS_USER">Operations</option>
                    </select>
                    <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                      <path d="M1 1L5 5L9 1" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input name="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required style={inputStyle} />
                  <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ ...inputStyle, paddingRight: '48px' }} />
                  <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {isRegister && (
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input name="rePassword" type="password" placeholder="••••••••" value={formData.rePassword} onChange={handleChange} required style={inputStyle} />
                    <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                </div>
              )}
            </div>

            {!isRegister && (
              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: brand, fontWeight: 700, textDecoration: 'none' }}>Forgot password?</Link>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', height: '54px', borderRadius: '14px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: loading ? '#f0a0a0' : brand, color: 'white', boxShadow: loading ? 'none' : `0 8px 24px ${brand}50`, marginTop: '10px' }}>
              {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
              {!loading && <ArrowRight size={18} />}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8', marginTop: '6px' }}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button type="button" onClick={() => navigate(isRegister ? '/login' : '/register')} style={{ background: 'none', border: 'none', color: brand, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', padding: 0, fontFamily: 'inherit' }}>
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
