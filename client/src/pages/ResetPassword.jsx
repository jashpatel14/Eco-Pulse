import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('session');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(token, password);
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
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
              <ShieldCheck size={48} color="var(--brand-primary)" />
            </div>
            <h2>Reset Password</h2>
            <p className="text-muted">Choose a new secure password</p>
          </div>

          {error && <div className="professional-alert alert-error">{error}</div>}
          {success && <div className="professional-alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>New Password</label>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Lock size={18} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Must contain uppercase, lowercase, a number, and a special character
              </p>
            </div>

            <div className="form-field">
              <label>Confirm Password</label>
              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <Lock size={18} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ width: '100%', marginTop: '20px' }}>
              {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              <Link to="/login" style={{ color: 'var(--brand-primary)', fontWeight: '600' }}>Back to Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
