import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-mesh" />
      <motion.div
        className="premium-auth-container standalone-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-side" style={{ width: '100%', padding: '40px' }}>
          <div className="auth-form-header" style={{ textAlign: 'center' }}>
            <div className="icon-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <KeyRound size={48} color="var(--brand-primary)" />
            </div>
            <h2>Forgot Password</h2>
            <p className="text-muted">Enter your email and we'll send you a reset link</p>
          </div>

          {error && <div className="professional-alert alert-error">{error}</div>}
          {success && <div className="professional-alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
              {loading ? 'Sending...' : 'Send Reset Link'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              Remember your password? <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
