import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, Trash2, Save, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('info');

  // Change password
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw]   = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const setPw = (k, v) => setPwForm(prev => ({ ...prev, [k]: v }));

  const handleChangePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      addToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setPwLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      addToast('Password changed successfully!', 'success');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      addToast('Email does not match. Account not deleted.', 'error');
      return;
    }
    setDeleteLoading(true);
    try {
      await api.delete('/auth/delete-account');
      addToast('Account deleted.', 'success');
      logout();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete account.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const ROLE_DESCRIPTIONS = {
    ADMIN: 'Full access — manage users, stages, approvals, and all PLM data.',
    ENGINEERING_USER: 'Can create products, BOMs, and raise ECOs.',
    APPROVER: 'Can review and approve / reject ECOs.',
    OPERATIONS_USER: 'Read-only access to active products and BOMs.',
    USER: 'Basic access.',
  };

  return (
    <div className="plm-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">My Profile</h1>
          <p className="page-desc">Manage your account settings and security</p>
        </div>
        <button className="btn-danger btn-sm" onClick={logout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Avatar card */}
      <motion.div
        className="glass-card"
        style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', fontWeight: 800, color: 'white', flexShrink: 0,
          boxShadow: '0 4px 16px rgba(99,102,241,0.35)'
        }}>
          {user?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 8 }}>{user?.email}</div>
          <span style={{
            background: 'var(--brand-soft)', color: 'var(--brand-primary)',
            border: '1px solid #c7d2fe', borderRadius: 999,
            padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700
          }}>
            {user?.role?.replace(/_/g, ' ')}
          </span>
        </div>
        <div style={{ marginLeft: 'auto', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Account Status</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#059669' }}>● Active & Verified</div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="tab-bar">
        {[['info','Account Info'],['security','Security'],['danger','Danger Zone']].map(([key,label]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Account Info ── */}
      {tab === 'info' && (
        <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="detail-grid">
            <div className="detail-field">
              <label><User size={12} style={{ display:'inline', marginRight: 4 }} />Full Name</label>
              <span>{user?.name}</span>
            </div>
            <div className="detail-field">
              <label><Mail size={12} style={{ display:'inline', marginRight: 4 }} />Email Address</label>
              <span>{user?.email}</span>
            </div>
            <div className="detail-field">
              <label><Shield size={12} style={{ display:'inline', marginRight: 4 }} />Role</label>
              <span className="plm-version-badge" style={{ maxWidth: 'fit-content' }}>{user?.role?.replace(/_/g, ' ')}</span>
            </div>
            <div className="detail-field">
              <label>Auth Method</label>
              <span>{user?.googleId ? '🟢 Google OAuth' : '🔑 Email / Password'}</span>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: 24 }}>Role Permissions</div>
          <div style={{
            background: 'var(--bg-page)', border: '1px solid var(--border-light)',
            borderRadius: 10, padding: '14px 18px', fontSize: '0.88rem', color: 'var(--text-dim)'
          }}>
            {ROLE_DESCRIPTIONS[user?.role] || 'Standard access.'}
          </div>
        </motion.div>
      )}

      {/* ── Security ── */}
      {tab === 'security' && (
        <motion.div className="glass-card" style={{ maxWidth: 580 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>Change Password</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            {user?.googleId
              ? '⚠️ Your account uses Google OAuth — password change is not available.'
              : 'Choose a strong password (min. 8 characters).'}
          </p>

          {user?.googleId ? (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px 18px', color: '#d97706', fontSize: '0.88rem' }}>
              To change your password, do so through your Google account settings.
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="plm-form">
              {[
                { label: 'Current Password', key: 'currentPassword', vis: showPw.current, toggle: () => setShowPw(p => ({...p, current: !p.current})) },
                { label: 'New Password',     key: 'newPassword',     vis: showPw.newPw,   toggle: () => setShowPw(p => ({...p, newPw: !p.newPw})) },
                { label: 'Confirm New Password', key: 'confirmPassword', vis: showPw.confirm, toggle: () => setShowPw(p => ({...p, confirm: !p.confirm})) },
              ].map(({ label, key, vis, toggle }) => (
                <div className="field-group" key={key}>
                  <label className="plm-label">{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="plm-input"
                      type={vis ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={e => setPw(key, e.target.value)}
                      required
                      style={{ paddingRight: 42 }}
                    />
                    <button type="button" onClick={toggle} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                    }}>
                      {vis ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-plm" disabled={pwLoading}>
                  <Save size={15} /> {pwLoading ? 'Saving…' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* ── Danger Zone ── */}
      {tab === 'danger' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card" style={{ border: '1.5px solid #fecdd3', maxWidth: 580 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} style={{ color: '#e11d48' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e11d48' }}>Delete Account</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This action is permanent and cannot be undone.</div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.6 }}>
              Deleting your account will permanently remove all your data from EcoPulse. 
              Type your email address <strong>{user?.email}</strong> below to confirm.
            </p>

            <div className="field-group" style={{ marginBottom: 14 }}>
              <label className="plm-label">Confirm Email Address</label>
              <input
                className="plm-input"
                placeholder={user?.email}
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                style={{ borderColor: '#fecdd3' }}
              />
            </div>

            <button
              className="btn-danger"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== user?.email || deleteLoading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Trash2 size={15} /> {deleteLoading ? 'Deleting…' : 'Permanently Delete My Account'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
