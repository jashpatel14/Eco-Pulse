import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Hash } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    email: '',
    password: '',
    rePassword: '',
    role: 'ENGINEERING_USER'
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    const path = window.location.pathname;
    setIsRegister(path === '/register');
  }, [window.location.pathname, isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateSignup = () => {
    const { loginId, email, password, rePassword } = formData;
    
    if (loginId.length < 6 || loginId.length > 12) {
      addToast("Login ID must be between 6 and 12 characters.", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addToast("Please enter a valid email address.", "error");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      addToast("Password must be at least 8 chars, with 1 uppercase, 1 lowercase, and 1 special character.", "error");
      return false;
    }

    if (password !== rePassword) {
      addToast("Passwords do not match.", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (isRegister) {
      if (!validateSignup()) return;
      setLoading(true);
      try {
        const res = await register({
          loginId: formData.loginId,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });
        addToast(res.message, 'success');
        navigate('/login');
      } catch (err) {
        addToast(err.response?.data?.message || 'Registration failed', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      if (!formData.loginId || !formData.password) {
        return addToast("Please fill all fields", "error");
      }
      setLoading(true);
      try {
        await login(formData.loginId, formData.password);
        addToast('Welcome back!', 'success');
        navigate('/dashboard');
      } catch (err) {
        addToast(err.response?.data?.message || 'Invalid Login Id or Password', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    navigate(isRegister ? '/login' : '/register');
  };

  return (
    <div className="auth-page" style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-page)', padding: '24px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Decorative Brand Glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'var(--brand-glow)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '40%', background: 'hsla(var(--h), 20%, 80%, 0.2)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: '420px', padding: '48px', zIndex: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
             width: '56px', height: '56px', background: 'var(--brand)', borderRadius: 'var(--radius-md)', 
             margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
             color: 'white', fontSize: '20px', fontWeight: 800,
             boxShadow: '0 8px 16px var(--brand-glow)'
          }}>EP</div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.92rem' }}>
            {isRegister ? 'Join the EcoPulse PLM community' : 'Access your PLM workspace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '16px' }}>
            <div className="form-field">
              <label className="plm-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Login ID</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="loginId"
                  placeholder={isRegister ? "# ID" : "jashborad13@gmail.com"}
                  value={formData.loginId}
                  onChange={handleChange}
                  required
                  style={{ 
                    padding: '0 16px 0 40px', width: '100%', height: '44px', borderRadius: '8px', 
                    border: '1px solid #e2e8f0', background: isRegister ? '#fff' : '#f1f5f9',
                    fontSize: '0.95rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <Hash size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            {isRegister && (
              <div className="form-field">
                <label className="plm-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Project Role</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{ 
                      padding: '0 36px 0 40px', width: '100%', height: '44px', borderRadius: '8px', 
                      border: '1px solid #e2e8f0', background: '#fff', appearance: 'none', 
                      color: '#1e293b', fontSize: '0.95rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
                    }}
                  >
                    <option value="ENGINEERING_USER">Engineer</option>
                    <option value="APPROVER">Approver</option>
                    <option value="OPERATIONS_USER">Operations</option>
                  </select>
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="form-field">
              <label className="plm-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ 
                    padding: '0 16px 0 40px', width: '100%', height: '44px', borderRadius: '8px', 
                    border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#1e293b', 
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isRegister ? '1fr 1fr' : '1fr', gap: '16px' }}>
            <div className="form-field">
              <label className="plm-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ 
                    padding: '0 40px 0 40px', width: '100%', height: '44px', borderRadius: '8px', 
                    border: '1px solid #e2e8f0', background: isRegister ? '#fff' : '#f1f5f9',
                    fontSize: '0.95rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="form-field">
                <label className="plm-label" style={{ fontWeight: 700, fontSize: '0.8rem', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Confirm</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="rePassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.rePassword}
                    onChange={handleChange}
                    required
                    style={{ 
                      padding: '0 16px 0 40px', width: '100%', height: '44px', borderRadius: '8px', 
                      border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#1e293b', 
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', marginTop: '8px', height: '48px', fontSize: '1rem', 
              background: '#ed8080', color: '#fff', border: 'none', borderRadius: '8px',
              fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(237, 128, 128, 0.4)'
            }}
          >
            {loading ? 'Processing...' : (isRegister ? 'SIGN UP' : 'SIGN IN')}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-dim)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            type="button"
            onClick={toggleMode}
            style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
