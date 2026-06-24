
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
            <Route path="/403" element={<div className="p-8 text-center text-slate-600">You don't have access to this page.</div>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}