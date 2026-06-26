import { useEffect, useState } from 'react';
import { listTasksRequest, updateTaskStatusRequest, deleteTaskRequest } from '../../api/tasksApi';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const COLUMNS = [
    { status: 'To Do',       dotClass: 'status-dot status-dot-todo',       label: 'To Do' },
    { status: 'In Progress', dotClass: 'status-dot status-dot-inprogress', label: 'In Progress' },
    { status: 'Completed',   dotClass: 'status-dot status-dot-done',       label: 'Completed' },
];

export default function TaskBoard() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    async function refresh() {
        const res = await listTasksRequest(filters);
        setTasks(res.data);
    }

    useEffect(() => { refresh(); }, [filters]);

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

    async function handleDelete(taskId) {
        await deleteTaskRequest(taskId);
        refresh();
    }

    const canCreate = user.role === 'Admin' || user.role === 'Project Manager';

    return (
        <div>
            {/* Page header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-lg)',
                    flexWrap: 'wrap',
                    gap: 'var(--space-sm)',
                }}
            >
                <div>
                    <h1 className="text-display" style={{ fontSize: 26, letterSpacing: '-0.625px' }}>
                        Tasks
                    </h1>
                    <p className="text-caption" style={{ marginTop: 2 }}>
                        Manage and track your team's work
                    </p>
                </div>
                {canCreate && (
                    <button
                        id="new-task-btn"
                        className="btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        + New Task
                    </button>
                )}
            </div>

            {/* Filters */}
            <TaskFilters filters={filters} onChange={setFilters} />

            {/* Kanban board */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 'var(--space-md)',
                    marginTop: 'var(--space-lg)',
                }}
                className="kanban-grid"
            >
                {COLUMNS.map((col) => {
                    const colTasks = tasks.filter((t) => t.status === col.status);
                    return (
                        <div key={col.status} className="kanban-column">
                            {/* Column header */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    paddingBottom: 'var(--space-sm)',
                                    borderBottom: '1px solid var(--color-hairline)',
                                }}
                            >
                                <span className={col.dotClass} />
                                <span className="text-eyebrow">{col.label}</span>
                                <span
                                    className="badge-pill"
                                    style={{
                                        marginLeft: 'auto',
                                        backgroundColor: 'var(--color-canvas)',
                                        color: 'var(--color-ink-muted)',
                                        fontSize: 11,
                                    }}
                                >
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Task cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {colTasks.map((t) => (
                                    <TaskCard
                                        key={t.id}
                                        task={t}
                                        onStatusChange={handleStatusChange}
                                        onDelete={canCreate ? handleDelete : null}
                                    />
                                ))}
                                {colTasks.length === 0 && (
                                    <div className="empty-state">
                                        <span style={{ fontSize: 22, opacity: 0.4 }}>◻</span>
                                        <p className="text-caption">No tasks here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task form modal */}
            {showForm && <TaskForm onClose={() => setShowForm(false)} onCreated={refresh} />}

            {/* Delete confirmation modal */}
            {confirmDelete && (
                <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
                    <div
                        className="card-elevated"
                        style={{ width: '100%', maxWidth: 420 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-card-title" style={{ marginBottom: 8 }}>
                            Delete task?
                        </h2>
                        <p className="text-body-sm" style={{ marginBottom: 24 }}>
                            "{confirmDelete.title}" and all its comments and attachments will be permanently removed.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                            <button
                                className="btn-danger"
                                onClick={async () => {
                                    await deleteTaskRequest(confirmDelete.id);
                                    setConfirmDelete(null);
                                    refresh();
                                }}
                            >
                                Delete
                            </button>
                            <button className="btn-utility" onClick={() => setConfirmDelete(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
