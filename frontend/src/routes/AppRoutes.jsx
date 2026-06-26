import { Routes, Route, Navigate } from 'react-router-dom';
import { authRoutes } from '../features/auth/auth.routes';
import { adminRoutes } from '../features/admin/admin.routes';
import { taskRoutes } from '../features/tasks/task.routes';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            {authRoutes}
            {adminRoutes}
            {taskRoutes}
            <Route
                path="/403"
                element={
                    <div
                        style={{
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--color-canvas-soft)',
                            gap: 12,
                        }}
                    >
                        <span style={{ fontSize: 48 }}>🔒</span>
                        <h1 className="text-heading">Access Denied</h1>
                        <p className="text-body">You don't have permission to view this page.</p>
                        <a href="/dashboard" className="btn-primary" style={{ marginTop: 8 }}>
                            Back to Dashboard
                        </a>
                    </div>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}