import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Zap, Clock, CheckCircle, AlertTriangle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const Dashboard = () => {
  const { user, getProfile, changePassword, deleteAccount, logout } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // New states for account management
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data.user);
      } catch (err) {
        addToast('Failed to load profile details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [getProfile, addToast]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
        return addToast('New passwords do not match', 'error');
    }
    setActionLoading(true);
    try {
        await changePassword(passwordData.current, passwordData.new);
        addToast('Password changed successfully. Please login again.', 'success');
        logout();
    } catch (err) {
        addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
        setActionLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setActionLoading(true);
    try {
        await deleteAccount();
        addToast('Account deleted. Goodbye!', 'success');
        logout();
    } catch (err) {
        addToast(err.response?.data?.message || 'Failed to delete account', 'error');
        setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Syncing your profile...</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-main">
      <div className="bg-mesh" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="welcome-section"
      >
        <h1 className="welcome-title">
          Welcome, <span className="logo-accent">{profile?.name || user?.name}</span>
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Your Secure EcoPulse Dashboard</p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="premium-grid"
      >
        {/* Profile Card */}
        <motion.div variants={item} className="pro-card">
          <div className="card-icon"><User className="logo-accent" size={32} /></div>
          <h3>Profile Info</h3>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{profile?.name || user?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email Address</span>
              <span className="detail-value">{profile?.email || user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className={`badge ${profile?.is_verified ? 'badge-success' : 'badge-warning'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {profile?.is_verified ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {profile?.is_verified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Security Card */}
        <motion.div variants={item} className="pro-card">
          <div className="card-icon"><Shield className="logo-accent" size={32} /></div>
          <h3>Security Status</h3>
          <div className="security-items">
            {[
              "JWT Authentication Active",
              "Bcrypt Password Hashing",
              "Validated Email Token",
              "IP Rate Limiting Active"
            ].map((text, i) => (
              <div key={i} className="security-item" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 15px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                <CheckCircle size={16} style={{ color: '#4ade80', marginRight: '10px' }} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack Card */}
        <motion.div variants={item} className="pro-card">
          <div className="card-icon"><Cpu className="logo-accent" size={32} /></div>
          <h3>System Core</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            {['PostgreSQL', 'Express', 'React', 'Node.js', 'Framer Motion', 'Lucide'].map((tech) => (
              <span key={tech} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', cursor: 'default' }}>
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Session Card */}
        <motion.div variants={item} className="pro-card">
          <div className="card-icon"><Clock className="logo-accent" size={32} /></div>
          <h3>Active Session</h3>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Auth Method</span>
              <span className="detail-value">JWT Bearer</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Expiration</span>
              <span className="detail-value">15 Minutes</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={14} /> Active
              </span>
            </div>
          </div>
        </motion.div>

        {/* Security & Settings Card */}
        <motion.div variants={item} className="pro-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-icon"><Shield className="logo-accent" size={32} /></div>
          <h3>Security & Account Settings</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
            {/* Change Password Form */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} className="logo-accent" /> Change Password
              </h4>
              <form onSubmit={handleChangePassword}>
                <div className="form-field">
                  <label>Current Password</label>
                  <div className="input-group">
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label>New Password</label>
                  <div className="input-group">
                    <input 
                      type="password" 
                      placeholder="Min. 8 chars" 
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="form-field" style={{ marginBottom: '16px' }}>
                  <label>Confirm New Password</label>
                  <div className="input-group">
                    <input 
                      type="password" 
                      placeholder="Re-enter password" 
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>

            {/* Danger Zone */}
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h4 style={{ marginBottom: '16px', color: '#ff8080', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Danger Zone
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="btn" 
                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ff8080', width: '100%', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  Delete My Account
                </button>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontWeight: '700', color: '#ff8080', marginBottom: '12px' }}>Are you absolutely sure?</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={handleDeleteAccount} 
                      className="btn" 
                      style={{ background: '#ef4444', color: 'white', flex: 1 }}
                      disabled={actionLoading}
                    >
                      {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)} 
                      className="btn btn-ghost" 
                      style={{ flex: 1 }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
