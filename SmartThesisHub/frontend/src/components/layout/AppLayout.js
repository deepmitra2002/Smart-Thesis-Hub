import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../utils/api';

const NAV_CONFIG = {
  student: [
    { path: '/dashboard',   icon: '📊', label: 'Dashboard' },
    { path: '/supervisors', icon: '👨‍🏫', label: 'Find Supervisors' },
    { path: '/projects',    icon: '📁', label: 'Project Ideas' },
    { path: '/resources',   icon: '🎬', label: 'Video Resources' },
    { path: '/requests',    icon: '📨', label: 'My Requests' },
    { path: '/feedback',    icon: '💬', label: 'Feedback' },
    { path: '/profile',     icon: '👤', label: 'My Profile' },
  ],
  supervisor: [
    { path: '/dashboard',   icon: '📊', label: 'Dashboard' },
    { path: '/requests',    icon: '📨', label: 'Student Requests', badgeKey: 'pendingRequests' },
    { path: '/students',    icon: '🎓', label: 'My Students' },
    { path: '/projects',    icon: '📁', label: 'Project Topics' },
    { path: '/profile',     icon: '👤', label: 'My Profile' },
    { path: '/feedback',    icon: '💬', label: 'Feedback' },
  ],
  admin: [
    { path: '/dashboard',         icon: '📊', label: 'Dashboard' },
    { path: '/admin/analytics',   icon: '📈', label: 'Analytics' },
    { path: '/admin/users',       icon: '👥', label: 'User Management' },
    { path: '/supervisors',       icon: '👨‍🏫', label: 'Supervisors' },
    { path: '/students',          icon: '🎓', label: 'Students' },
    { path: '/projects',          icon: '📁', label: 'Project Topics' },
    { path: '/requests',          icon: '📨', label: 'All Requests' },
    { path: '/feedback',          icon: '💬', label: 'Feedback' },
  ],
};

const ROLE_COLOR = { student: 'var(--lav-100)', supervisor: '#fdf4ff', admin: '#f0fdf4' };
const ROLE_EMOJI = { student: '🎓', supervisor: '👨‍🏫', admin: '🛠️' };

export default function AppLayout() {
  const { user, logout, notifications, unreadCount, setNotifications } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const notifRef = useRef(null);

  const navItems = NAV_CONFIG[user?.role] || [];

  // Get page title from path
  const pageTitle = navItems.find(n => location.pathname.startsWith(n.path))?.label
    || (location.pathname === '/admin/analytics' ? 'Analytics' : 'Dashboard');

  // Close notif panel when clicking outside
  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const markAllRead = async () => {
    try {
      await notificationAPI.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar overlay (mobile) */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="sidebar-logo">Smart<span>Thesis</span>Hub</div>
          <div className="sidebar-uni">Daffodil International University</div>
        </div>

        <div className="sidebar-user">
          <div className="user-ava" style={{ background: ROLE_COLOR[user?.role] }}>
            {ROLE_EMOJI[user?.role]}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role-text">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-lbl">Navigation</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.badgeKey && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>🚪 Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="hamburger" onClick={() => setSidebarOpen(v => !v)}>☰</span>
            <div className="topbar-title">{pageTitle}</div>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search supervisors, projects…"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value) {
                  if (location.pathname === '/supervisors') navigate(`/supervisors?q=${e.target.value}`);
                  else navigate(`/projects?q=${e.target.value}`);
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Notification bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setNotifOpen(v => !v)}>
                🔔
                {unreadCount > 0 && <div className="notif-dot" />}
              </button>

              {notifOpen && (
                <div className="notif-panel">
                  <div className="notif-head">
                    Notifications
                    <span className="notif-clear" onClick={markAllRead}>Clear all</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      No notifications
                    </div>
                  ) : notifications.slice(0, 10).map((n, i) => (
                    <div
                      key={i}
                      className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => {
                        setNotifications(prev => prev.map((x, j) => j === i ? { ...x, isRead: true } : x));
                      }}
                    >
                      <div className="ni-title">{n.title}</div>
                      <div className="ni-body">{n.body}</div>
                      <div className="ni-time">{n.time || new Date(n.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="icon-btn" onClick={() => navigate('/profile')}>👤</button>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
