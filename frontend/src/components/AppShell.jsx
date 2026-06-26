import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import NotificationBell from '../features/notifications/NotificationBell';
import NotificationPanel from '../features/notifications/NotificationPanel';
import { listProjectsRequest } from '../api/projectsApi';

const ROLE_BADGE = {
  Admin:             { bg: '#fce7f3', color: '#9d174d' },
  'Project Manager': { bg: '#eff6ff', color: '#1d6fa8' },
  Collaborator:      { bg: '#f0fdf4', color: '#15803d' },
};

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const location = useLocation();

  const roleStyle = ROLE_BADGE[user?.role] ?? {};
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    if (user) {
      listProjectsRequest().then(setProjects).catch(console.error);
    }
  }, [user]);

  return (
    <SocketProvider>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-canvas-soft)' }}>
        
        {/* ── Sidebar ── */}
        <aside
          style={{
            width: 260,
            borderRight: '1px solid var(--color-hairline)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--space-lg) var(--space-md)',
            flexShrink: 0,
          }}
        >
          {/* Wordmark */}
          <Link to="/dashboard" className="nav-wordmark" style={{ marginBottom: 'var(--space-xl)', paddingLeft: 'var(--space-sm)' }}>
            <span className="nav-wordmark-icon">T</span>
            <span>TaskFlow</span>
          </Link>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Link
              to="/dashboard"
              className={`btn-utility${isActive('/dashboard') ? ' nav-active' : ''}`}
              style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '8px 12px' }}
            >
              <span style={{ marginRight: 8, opacity: 0.6 }}>🏠</span> Dashboard
            </Link>
            
            <Link
              to="/tasks"
              className={`btn-utility${isActive('/tasks') ? ' nav-active' : ''}`}
              style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '8px 12px' }}
            >
              <span style={{ marginRight: 8, opacity: 0.6 }}>📋</span> Tasks
            </Link>

            {user?.role === 'Admin' && (
              <Link
                to="/users"
                className={`btn-utility${isActive('/users') ? ' nav-active' : ''}`}
                style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '8px 12px' }}
              >
                <span style={{ marginRight: 8, opacity: 0.6 }}>👥</span> Users
              </Link>
            )}

            {/* Projects Section */}
            <div style={{ marginTop: 'var(--space-xl)', paddingLeft: 'var(--space-sm)' }}>
              <p className="text-eyebrow" style={{ color: 'var(--color-ink-muted)', marginBottom: 8 }}>PROJECTS</p>
              {projects.length === 0 ? (
                <p className="text-caption" style={{ color: 'var(--color-ink-faint)' }}>No projects found</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {projects.map((p) => (
                    <li key={p.id}>
                      <Link 
                        to={`/tasks?project_id=${p.id}`} 
                        className="btn-utility"
                        style={{ textDecoration: 'none', justifyContent: 'flex-start', padding: '6px 12px', width: '100%', fontWeight: 400 }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--color-primary)', marginRight: 8, opacity: 0.8 }} />
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          {/* User Profile & Logout */}
          <div style={{ borderTop: '1px solid var(--color-hairline)', paddingTop: 'var(--space-md)', marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-sm)', padding: '0 4px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 'var(--rounded-full)', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
                <span
                  className="badge-pill"
                  style={{
                    backgroundColor: roleStyle.bg,
                    color: roleStyle.color,
                    borderColor: 'transparent',
                    fontSize: 10,
                    padding: '2px 6px',
                    display: 'inline-block',
                    marginTop: 2
                  }}
                >
                  {user?.role}
                </span>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="btn-utility"
              id="logout-btn"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--color-ink-muted)' }}
            >
              Log out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          
          {/* Header */}
          <header style={{ 
            height: 60, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end', 
            padding: '0 var(--space-xl)', 
            borderBottom: '1px solid var(--color-hairline)',
            backgroundColor: 'var(--color-surface)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            {/* Notification bell + panel */}
            <div style={{ position: 'relative' }}>
              <NotificationBell onClick={() => setPanelOpen((o) => !o)} />
              <NotificationPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
            </div>
          </header>

          <main
            style={{
              padding: 'var(--space-xl)',
              maxWidth: 1100,
              margin: '0 auto',
              width: '100%'
            }}
          >
            {children}
          </main>
        </div>

      </div>
    </SocketProvider>
  );
}
