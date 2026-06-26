import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import CollaboratorDashboard from './CollaboratorDashboard';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="animate-fade-in p-6 md:p-8">
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
                    Dashboard
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Track and manage your project tasks</p>
            </div>
            
            {user.role === 'Admin' && <AdminDashboard />}
            {user.role === 'Project Manager' && <ManagerDashboard />}
            {user.role === 'Collaborator' && <CollaboratorDashboard />}
        </div>
    );
}
