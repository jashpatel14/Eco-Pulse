import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/api';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  const hasRun = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please check your email link.');
      return;
    }

    const verifyEmail = async () => {
      if (hasRun.current) return;
      hasRun.current = true;

      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="auth-page">
      <div className="bg-mesh" />
      <motion.div
        className="premium-auth-container standalone-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="auth-side" style={{ width: '100%', padding: '60px 40px', textAlign: 'center' }}>
          <div className="auth-form-header" style={{ marginBottom: '40px' }}>
            {status === 'verifying' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <Loader2 size={64} color="var(--brand-primary)" style={{ animation: 'spin 2s linear infinite' }} />
                </div>
                <h2>Verifying Email</h2>
                <p style={{ color: 'var(--text-muted)' }}>Please wait while we verify your email address...</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldCheck size={64} style={{ color: '#10b981' }} />
                </div>
                <h2 style={{ color: '#10b981' }}>Email Verified!</h2>
                <p style={{ color: 'var(--text-muted)' }}>{message}</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                  <ShieldAlert size={64} style={{ color: '#ef4444' }} />
                </div>
                <h2 style={{ color: '#ef4444' }}>Verification Failed</h2>
                <p style={{ color: 'var(--text-muted)' }}>{message}</p>
              </motion.div>
            )}
          </div>

          {status !== 'verifying' && (
            <Link to="/login" className="btn btn-primary btn-full" style={{ maxWidth: '300px', margin: '0 auto' }}>
              Go to Login
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
