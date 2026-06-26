import { useEffect, useState } from 'react';
import { listTasksRequest, updateTaskStatusRequest, deleteTaskRequest } from '../../api/tasksApi';
import { listUsersRequest } from '../../api/usersApi';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const COLUMNS = ['To Do', 'In Progress', 'Completed'];

const COLUMN_COLORS = {
  'To Do': { dot: 'bg-indigo-500', glow: 'shadow-indigo-500/10' },
  'In Progress': { dot: 'bg-amber-500', glow: 'shadow-amber-500/10' },
  'Completed': { dot: 'bg-emerald-500', glow: 'shadow-emerald-500/10' }
};

const PRIORITY_BADGES = { 
  Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', 
  Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', 
  High: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
};

const STATUS_BADGES = {
  'To Do': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Completed': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
};

export default function TaskBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ 
    status: '', 
    priority: '', 
    search: '', 
    sortBy: 'due_date', 
    sortOrder: 'asc', 
    viewMode: 'board' 
  });
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function refresh() {
    const res = await listTasksRequest({
      status: filters.status,
      priority: filters.priority,
      sortBy: filters.sortBy,
      order: filters.sortOrder
    });
    setTasks(res.data);
  }

  useEffect(() => {
    refresh();
  }, [filters.status, filters.priority, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    listUsersRequest({}).then((res) => setUsers(res.data));
  }, []);

  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;
    const handler = (notification) => {
      if (['task_assigned', 'status_changed', 'comment_added'].includes(notification.type)) {
        refresh();
      }
    };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, [socket]);

  async function handleStatusChange(taskId, newStatus) {
    await updateTaskStatusRequest(taskId, newStatus);
    refresh();
  }

  const canCreate = user?.role === 'Admin' || user?.role === 'Project Manager';

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayedTasks = tasks
    .filter((t) => !filters.search || t.title.toLowerCase().includes(filters.search.toLowerCase()))
    .sort((a, b) => {
      let valA = a[filters.sortBy] || '';
      let valB = b[filters.sortBy] || '';
      
      if (filters.sortBy === 'priority') {
        const priorityWeight = { High: 3, Medium: 2, Low: 1 };
        valA = priorityWeight[a.priority] || 0;
        valB = priorityWeight[b.priority] || 0;
      }
      
      const orderFactor = filters.sortOrder === 'asc' ? 1 : -1;
      if (valA < valB) return -1 * orderFactor;
      if (valA > valB) return 1 * orderFactor;
      return 0;
    });

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in">
      
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Task Board
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">Manage, assign, and organize team tasks.</p>
        </div>
        {canCreate && (
          <button 
            onClick={() => setShowForm(true)} 
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 border-0 rounded-lg flex items-center gap-2 transition-all duration-200"
          >
            + New Task
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div>
        <TaskFilters filters={filters} onChange={setFilters} />
      </div>
      
      {/* View Mode Switching */}
      {filters.viewMode === 'board' ? (
        /* Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {COLUMNS.map((col) => {
            const colTasks = displayedTasks.filter((t) => t.status === col);
            const colStyles = COLUMN_COLORS[col] || COLUMN_COLORS['To Do'];
            
            return (
              <div 
                key={col} 
                className="glass-panel p-5 rounded-2xl flex flex-col gap-4 bg-slate-900/35 border border-slate-800/80 hover:border-slate-850 transition-all duration-300"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colStyles.dot}`} />
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{col}</h2>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 bg-slate-950/65 border border-slate-800/60 text-slate-400 font-extrabold rounded-full">
                    {colTasks.length}
                  </span>
                </div>
                
                {/* Task List */}
                <div className="flex flex-col gap-3.5 min-h-[250px]">
                  {colTasks.map((t) => (
                    <TaskCard 
                      key={t.id} 
                      task={t} 
                      users={users}
                      onStatusChange={handleStatusChange} 
                      onDelete={canCreate ? setConfirmDelete : null} 
                    />
                  ))}
                  
                  {colTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-800/75 rounded-xl text-slate-500 bg-slate-950/15">
                      <svg className="w-8 h-8 text-slate-700 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                      <p className="text-xs font-semibold text-slate-400">No Tasks</p>
                      <p className="text-[10px] text-slate-500 mt-1">Ready for something new.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel overflow-hidden border border-slate-800/80 bg-slate-900/35 rounded-2xl shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Assignees</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTasks.map((t) => {
                  const assigneeList = (t.assignees || []).map((id) => users.find((u) => u.id === id)).filter(Boolean);
                  const nextStatus = { 'To Do': 'In Progress', 'In Progress': 'Completed', 'Completed': 'To Do' }[t.status];
                  
                  return (
                    <tr key={t.id} className="border-b border-slate-800/40 hover:bg-slate-850/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-200">{t.title}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGES[t.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${COLUMN_COLORS[t.status]?.dot || 'bg-slate-400'}`} />
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_BADGES[t.priority]}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{t.due_date}</td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {assigneeList.slice(0, 3).map((u) => (
                            <span 
                              key={u.id} 
                              className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-300 ring-1 ring-slate-950 uppercase" 
                              title={`${u.name} (${u.role})`}
                            >
                              {getInitials(u.name)}
                            </span>
                          ))}
                          {assigneeList.length > 3 && (
                            <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[9px] font-bold text-slate-400 ring-1 ring-slate-950">
                              +{assigneeList.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleStatusChange(t.id, nextStatus)}
                            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors border border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-500/5 px-2.5 py-1 rounded"
                            title={`Move to ${nextStatus}`}
                          >
                            Cycle Status
                          </button>
                          {canCreate && (
                            <button
                              onClick={() => setConfirmDelete(t)}
                              className="text-slate-500 hover:text-rose-400 transition-all p-1"
                              title="Delete task"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {displayedTasks.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-slate-500">
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* New Task Overlay Modal */}
      {showForm && <TaskForm onClose={() => setShowForm(false)} onCreated={refresh} />}
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4 text-left">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Delete Task</h3>
              <p className="text-xs text-slate-400 mt-1">This action cannot be undone.</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-indigo-400">"{confirmDelete.title}"</span>? All comments and attachments will be lost forever.
            </p>
            <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800/60">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => { 
                  await deleteTaskRequest(confirmDelete.id); 
                  setConfirmDelete(null); 
                  refresh(); 
                }} 
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-lg shadow-rose-600/10"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


