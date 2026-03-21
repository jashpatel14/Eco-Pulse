import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationPanel() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (_) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    setUnreadCount(0);
  };

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      await api.patch(`/notifications/${notif.id}/read`);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    }
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div className="notif-wrapper" ref={panelRef}>
      {/* Compact icon-only bell inside the sidebar header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: open ? 'var(--brand-soft)' : 'transparent',
          border: '1px solid', borderColor: open ? 'var(--brand)' : 'var(--border-light)',
          borderRadius: 8, width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: open ? 'var(--brand)' : 'var(--text-muted)',
          transition: 'all 0.15s',
        }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Panel floats to the RIGHT of the sidebar, fixed position */}
      {open && (
        <div
          className="notif-panel"
          style={{
            position: 'fixed',
            top: 16,
            left: 'calc(var(--sidebar-w) + 12px)',
            right: 'auto',
            zIndex: 9999,
          }}
        >
          <div className="notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={markAllRead}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <p className="notif-empty">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${!n.isRead ? 'notif-unread' : ''}`}
                  onClick={() => handleClick(n)}
                >
                  {!n.isRead && <span className="notif-dot" />}
                  <div className="notif-content">
                    <p className="notif-message">{n.message}</p>
                    <span className="notif-time">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
