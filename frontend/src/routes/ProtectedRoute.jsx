import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards authenticated pages.
 * Layout (AppShell) is injected per-route in each feature's route file
 * so auth pages (Login, ResetPassword) remain shell-free.
 */
export default function ProtectedRoute({ roles, children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;
    return children;
}