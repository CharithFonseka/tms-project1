import { Route } from 'react-router-dom';
import UserList from './UserList';
import ProtectedRoute from '../../routes/ProtectedRoute';
import AppShell from '../../components/AppShell';

export const adminRoutes = (
    <>
        <Route
            path="/users"
            element={
                <ProtectedRoute roles={['Admin']}>
                    <AppShell>
                        <UserList />
                    </AppShell>
                </ProtectedRoute>
            }
        />
    </>
);