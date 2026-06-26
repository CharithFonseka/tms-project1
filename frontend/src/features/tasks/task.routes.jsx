import { Route } from 'react-router-dom';
import TaskBoard from './TaskBoard';
import ProtectedRoute from '../../routes/ProtectedRoute';
import AppShell from '../../components/AppShell';

export const taskRoutes = (
    <Route
        path="/dashboard"
        element={
            <ProtectedRoute>
                <AppShell>
                    <TaskBoard />
                </AppShell>
            </ProtectedRoute>
        }
    />
);
