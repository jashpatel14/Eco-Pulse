import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Chrome, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Auth = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const path = window.location.pathname;
    setIsRegister(path === '/register');
  }, [window.location.pathname]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await login(loginData.email, loginData.password);
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.errors) {
        addToast(err.response.data.errors.map(e => e.message).join(', '), 'error');
      } else {
        addToast(err.response?.data?.message || 'Invalid credentials. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const data = await register(registerData.name, registerData.email, registerData.password);
      addToast(data.message, 'success');
      setTimeout(() => navigate('/login'), 5000);
    } catch (err) {
      if (err.response?.data?.errors) {
        addToast(err.response.data.errors.map(e => e.message).join(', '), 'error');
      } else {
        addToast(err.response?.data?.message || 'Registration failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    navigate(!isRegister ? '/register' : '/login');
  };

  return (
    <div className="auth-page">
      <div className="bg-mesh" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="premium-auth-container"
      >
        {/* Left Side: Form Container */}
        <motion.div 
          animate={{ x: isRegister ? '100%' : '0%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="auth-side"
        >
          <AnimatePresence mode="wait">
            {isRegister ? (
              <motion.div
                key="register"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-form-header">
                  <h2>Create Account</h2>
                  <p>Join the EcoPulse community today.</p>
                </div>

                <form onSubmit={handleRegisterSubmit}>
                  <div className="form-field">
                    <label>Full Name</label>
                    <div className="input-group">
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                      />
                      <User size={18} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Email Address</label>
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="name@company.com"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                      />
                      <Mail size={18} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                      />
                      <Lock size={18} />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '40px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                    {loading ? 'Processing...' : 'Sign Up'} <ArrowRight size={18} />
                  </button>

                  <div className="divider">Or continue with</div>

                  <button 
                    type="button" 
                    className="btn btn-social" 
                    onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/google'}
                  >
                    <Chrome size={20} /> Google
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <div className="auth-form-header">
                  <h2>Welcome Back</h2>
                  <p>Secure access to your account.</p>
                </div>

                <form onSubmit={handleLoginSubmit}>
                  <div className="form-field">
                    <label>Email Address</label>
                    <div className="input-group">
                      <input
                        type="email"
                        name="email"
                        placeholder="name@company.com"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                      />
                      <Mail size={18} />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                      <Lock size={18} />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '40px', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '32px' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: '600' }}>
                      Forgot Password?
                    </Link>
                  </div>

                  <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ width: '100%' }}>
                    {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                  </button>

                  <div className="divider">Or continue with</div>

                  <button 
                    type="button" 
                    className="btn btn-social" 
                    onClick={() => window.location.href = 'http://localhost:5000/api/v1/auth/google'}
                  >
                    <Chrome size={20} /> Google
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mobile-toggle" style={{ textAlign: 'center', marginTop: '32px' }}>
            {isRegister ? "Already have an account?" : "Don't have an account?"}{' '}
            <span onClick={toggleMode} style={{ color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: '700' }}>
              {isRegister ? 'Sign In' : 'Sign Up'}
            </span>
          </div>
        </motion.div>

        {/* Right Side: Overlay */}
        <motion.div 
          animate={{ x: isRegister ? '-100%' : '0%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="auth-overlay-panel"
          style={{ left: '50%' }}
        >
          <AnimatePresence mode="wait">
            {!isRegister ? (
              <motion.div
                key="to-register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1>New Here?</h1>
                <p>Join the EcoPulse community and start your journey today!</p>
                <button className="btn btn-overlay" onClick={toggleMode} style={{ minWidth: '180px' }}>
                  Create Account
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="to-login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <h1>One of us?</h1>
                <p>Already a member? Sign in to continue where you left off!</p>
                <button className="btn btn-overlay" onClick={toggleMode} style={{ minWidth: '180px' }}>
                  Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
