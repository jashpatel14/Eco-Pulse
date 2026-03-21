import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import CustomSelect from '../components/CustomSelect';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ loginId: '', email: '', password: '', rePassword: '', role: 'ENGINEERING_USER' });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    setIsRegister(location.pathname === '/register');
  }, [location.pathname, isAuthenticated, navigate]);

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

  const inputStyle = { 
    width: '100%', height: '54px', 
    padding: '0 16px 0 16px', 
    borderRadius: 'var(--radius-md)', 
    border: '1.5px solid var(--border-medium)', 
    background: '#ffffff', 
    fontSize: '0.95rem', 
    color: 'var(--text-main)', 
    outline: 'none', 
    boxSizing: 'border-box', 
    fontFamily: 'inherit',
    transition: 'all 0.3s var(--ease)'
  };
  
  const labelStyle = { 
    display: 'block', 
    fontSize: '0.9rem', 
    fontWeight: 600, 
    color: 'var(--text-main)', 
    marginBottom: '8px' 
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
      {/* --- FORM SECTION (LEFT) --- */}
      <div style={{ flex: '1.2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.04em', marginBottom: '10px' }}>
              {isRegister ? 'Join EcoPulse' : 'Welcome back!'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5 }}>
              {isRegister ? 'Start your journey with modern PLM.' : 'Simplify your workflow and boost your productivity with EcoPulse.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Login ID or Username</label>
              <input name="loginId" placeholder="Enter your login ID" value={formData.loginId} onChange={handleChange} required style={inputStyle} />
            </div>

            {isRegister && (
              <>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input name="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Project Role</label>
                  <CustomSelect 
                    value={formData.role} 
                    onChange={val => setFormData({ ...formData, role: val })} 
                    options={[
                      { value: "ENGINEERING_USER", label: "Engineer" },
                      { value: "APPROVER", label: "Approver" },
                      { value: "OPERATIONS_USER", label: "Operations" }
                    ]}
                  />
                </div>
              </>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                {!isRegister && (
                  <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600, textDecoration: 'none' }}>Forgot Password?</Link>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} required style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input name="rePassword" type="password" placeholder="••••••••" value={formData.rePassword} onChange={handleChange} required style={inputStyle} />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-plm" style={{ width: '100%', height: '52px', marginTop: '4px', justifyContent: 'center' }}>
              {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Login')}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-dim)', marginTop: '12px' }}>
              {isRegister ? 'Already a member? ' : "Not a member? "}
              <button type="button" onClick={() => navigate(isRegister ? '/login' : '/register')} style={{ background: 'none', border: 'none', color: 'var(--brand)', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', padding: 0 }}>
                {isRegister ? 'Login now' : 'Register now'}
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* --- ILLUSTRATION SECTION (RIGHT) --- */}
      <div style={{ flex: '1', background: 'var(--brand-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, hsla(140, 40%, 45%, 0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '250px', height: '250px', background: 'radial-gradient(circle, hsla(140, 40%, 45%, 0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '480px' }}>
          <img src="/assets/auth_illustration.png" alt="EcoPulse Illustration" style={{ width: '100%', height: 'auto', marginBottom: '32px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.05))' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {isRegister ? 'Accelerate engineering' : 'Organize your product data'}
          </h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {isRegister ? 'Join the most advanced PLM platform for modern engineering teams.' : 'Make your work easier and more organized with EcoPulse.'}
          </p>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '32px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--brand)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--border-medium)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'var(--border-medium)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
