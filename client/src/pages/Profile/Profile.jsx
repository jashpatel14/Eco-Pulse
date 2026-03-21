import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, Shield, AlertTriangle, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return addToast("Passwords do not match", "error");
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      addToast("Password changed successfully", "success");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      addToast("Account entirely removed from EcoPulse.", "success");
      logout();
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete account", "error");
    }
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-desc">Manage your account information and security</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column (Details and Password) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Account Information */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserIcon size={20} color="var(--brand)" /> Account Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="plm-label">Name</label>
                <div className="plm-input" style={{ background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center' }}>{user?.name}</div>
              </div>
              <div>
                <label className="plm-label">Login ID</label>
                <div className="plm-input" style={{ background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center' }}>{user?.loginId}</div>
              </div>
              <div>
                <label className="plm-label">Email Address</label>
                <div className="plm-input" style={{ background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center' }}>{user?.email || 'N/A'}</div>
              </div>
              <div>
                <label className="plm-label">Project Role</label>
                <div className="plm-input" style={{ background: '#f8fafc', color: '#64748b', display: 'flex', alignItems: 'center' }}>{user?.role.replace(/_/g, ' ')}</div>
              </div>
            </div>
          </motion.div>

          {/* Change Password */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={20} color="var(--brand)" /> Update Security
            </h3>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="plm-label">Current Password</label>
                <input 
                  type="password" className="plm-input" required
                  value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="plm-label">New Password</label>
                  <input 
                    type="password" className="plm-input" required
                    value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <label className="plm-label">Confirm Password</label>
                  <input 
                    type="password" className="plm-input" required
                    value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-plm btn-brand" style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </motion.div>

        </div>

        {/* Right Column (Danger Zone) */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ border: '1px solid #fee2e2', background: '#fffcfc' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
            <AlertTriangle size={20} /> Danger Zone
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>
            Once you delete your account, there is no going back. All of your personal data, draft changes, created ECOs, approval rules, and audit logs will be permanently wiped from the EcoPulse system to clear your audit history.
          </p>

          {!showConfirmDelete ? (
            <button className="btn-plm" style={{ background: '#dc2626', color: 'white', width: '100%', borderColor: '#dc2626' }} onClick={() => setShowConfirmDelete(true)}>
              Delete Account
            </button>
          ) : (
            <div style={{ background: '#fef2f2', padding: 16, borderRadius: 8, border: '1px solid #fecaca' }}>
              <p style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: 700, marginBottom: 12 }}>Are you absolutely sure?</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-plm" style={{ background: '#dc2626', color: 'white', flex: 1, borderColor: '#dc2626' }} onClick={handleDeleteAccount}>
                  Yes, Delete
                </button>
                <button className="btn-outline" style={{ flex: 1, background: 'white' }} onClick={() => setShowConfirmDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
