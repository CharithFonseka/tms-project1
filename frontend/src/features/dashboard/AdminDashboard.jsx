import { useState, useEffect } from 'react';
import { listUsersRequest } from '../../api/usersApi';
import { listTasksRequest } from '../../api/tasksApi';
import StatCard from './StatCard';
import TaskBoard from '../tasks/TaskBoard';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalTasks: 0, completedTasks: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            listUsersRequest({ limit: 1000 }),
            listTasksRequest({ limit: 1000 })
        ]).then(([usersRes, tasksRes]) => {
            const users = usersRes.data || [];
            const tasks = tasksRes.data || [];
            setStats({
                totalUsers: users.length,
                activeUsers: users.filter(u => u.is_active).length,
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'Completed').length
            });
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="text-slate-400 font-medium">Loading system metrics...</div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="indigo" />
                <StatCard title="Active Users" value={stats.activeUsers} icon="✅" color="emerald" />
                <StatCard title="Total Tasks" value={stats.totalTasks} icon="📋" color="amber" />
                <StatCard title="Completed Tasks" value={stats.completedTasks} icon="🎯" color="emerald" />
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border bg-slate-900/35 border-slate-800/80">
                <h2 className="text-lg font-bold text-slate-200 mb-4">System Health</h2>
                <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-slate-300">All systems are operational. The platform is running smoothly.</span>
                </div>
            </div>

            <div className="mt-4">
                <TaskBoard hideHeader={true} />
            </div>
        </div>
    );
}
