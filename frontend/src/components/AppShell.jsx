import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import NotificationBell from '../features/notifications/NotificationBell';
import NotificationPanel from '../features/notifications/NotificationPanel';

/* Role badge colour mapping — uses sticker palette for decoration */
const ROLE_BADGE = {
  Admin:             { bg: '#fce7f3', color: '#9d174d' },
  'Project Manager': { bg: '#eff6ff', color: '#1d6fa8' },
  Collaborator:      { bg: '#f0fdf4', color: '#15803d' },
};

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const location = useLocation();

  const roleStyle = ROLE_BADGE[user?.role] ?? {};
  const isActive = (path) => location.pathname === path;

  return (
    <SocketProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-canvas-soft)' }}>

        {/* ── Top navigation bar ── */}
        <nav className="nav-bar">
          {/* Wordmark */}
          <Link to="/dashboard" className="nav-wordmark">
            <span className="nav-wordmark-icon">T</span>
            <span>TaskFlow</span>
          </Link>

          {/* Centre nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link
              to="/dashboard"
              className={`btn-utility${isActive('/dashboard') ? ' nav-active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            {user?.role === 'Admin' && (
              <Link
                to="/users"
                className={`btn-utility${isActive('/users') ? ' nav-active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                Users
              </Link>
            )}
          </div>

          {/* Right: role badge + bell + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Role badge */}
            <span
              className="badge-pill hide-mobile"
              style={{
                backgroundColor: roleStyle.bg,
                color: roleStyle.color,
                borderColor: 'transparent',
              }}
            >
              {user?.role}
            </span>

            {/* Notification bell + panel */}
            <div style={{ position: 'relative' }}>
              <NotificationBell onClick={() => setPanelOpen((o) => !o)} />
              <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="btn-utility"
              id="logout-btn"
              style={{ color: 'var(--color-ink-muted)' }}
            >
              Log out
            </button>
          </div>
        </nav>

        {/* ── Page content ── */}
        <main
          style={{
            maxWidth: 1300,
            margin: '0 auto',
            padding: 'var(--space-xxl) var(--space-xxl)',
          }}
        >
          {children}
        </main>
      </div>
    </SocketProvider>
  );
}
