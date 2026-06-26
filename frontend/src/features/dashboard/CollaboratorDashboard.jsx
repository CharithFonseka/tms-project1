import { useState, useEffect } from 'react';
import { listTasksRequest } from '../../api/tasksApi';
import { useAuth } from '../../context/AuthContext';
import StatCard from './StatCard';
import TaskBoard from '../tasks/TaskBoard';

export default function CollaboratorDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, highPriority: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listTasksRequest({ limit: 1000 }).then(res => {
            const tasks = res.data || [];
            // Filter tasks assigned to this user
            const myTasks = tasks.filter(t => t.assignees && t.assignees.includes(user.id));
            
            setStats({
                total: myTasks.length,
                todo: myTasks.filter(t => t.status === 'To Do').length,
                inProgress: myTasks.filter(t => t.status === 'In Progress').length,
                completed: myTasks.filter(t => t.status === 'Completed').length,
                highPriority: myTasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length
            });
            setLoading(false);
        });
    }, [user.id]);

    if (loading) return <div className="text-slate-400 font-medium">Loading your metrics...</div>;

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="My Tasks" value={stats.total} icon="📋" color="indigo" />
                <StatCard title="In Progress" value={stats.inProgress} icon="⏳" color="amber" />
                <StatCard title="Completed" value={stats.completed} icon="🎯" color="emerald" />
                <StatCard title="Action Required" value={stats.highPriority} icon="🔥" color="rose" />
            </div>
            
            <div className="mt-4">
                <TaskBoard hideHeader={true} />
            </div>
        </div>
    );
}
