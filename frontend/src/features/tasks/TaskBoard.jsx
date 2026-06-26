import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listTasksRequest, updateTaskStatusRequest, deleteTaskRequest } from '../../api/tasksApi';
import { getProjectRequest } from '../../api/projectsApi';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';

const COLUMNS = [
    { status: 'To Do',       dotClass: 'status-dot status-dot-todo',       label: 'To Do' },
    { status: 'In Progress', dotClass: 'status-dot status-dot-inprogress', label: 'In Progress' },
    { status: 'Completed',   dotClass: 'status-dot status-dot-done',       label: 'Completed' },
];

function KanbanColumn({ col, tasks, canCreate, handleStatusChange, handleDelete }) {
    const { setNodeRef } = useDroppable({
        id: col.status,
        data: { type: 'Column', status: col.status }
    });

    return (
        <div className="kanban-column" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Column header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    paddingBottom: 'var(--space-sm)',
                    borderBottom: '1px solid var(--color-hairline)',
                    marginBottom: 'var(--space-sm)'
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
                    {tasks.length}
                </span>
            </div>

            {/* Task cards list */}
            <div ref={setNodeRef} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', flex: 1, minHeight: 150 }}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((t) => (
                        <TaskCard
                            key={t.id}
                            task={t}
                            onStatusChange={handleStatusChange}
                            onDelete={canCreate ? handleDelete : null}
                        />
                    ))}
                </SortableContext>
                
                {tasks.length === 0 && (
                    <div className="empty-state" style={{ marginTop: 'var(--space-sm)' }}>
                        <span style={{ fontSize: 22, opacity: 0.4 }}>◻</span>
                        <p className="text-caption">No tasks here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function TaskBoard() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const projectId = searchParams.get('project_id');
    
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
    const [showForm, setShowForm] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);
    
    const [activeTask, setActiveTask] = useState(null);

    async function refresh() {
        const queryParams = { ...filters };
        if (projectId) queryParams.project_id = projectId;
        const res = await listTasksRequest(queryParams);
        setTasks(res.data);
    }

    useEffect(() => {
        if (projectId) {
            getProjectRequest(projectId).then(setProject).catch(() => setProject(null));
        } else {
            setProject(null);
        }
    }, [projectId]);

    useEffect(() => { refresh(); }, [filters, projectId]);

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
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        await updateTaskStatusRequest(taskId, newStatus);
        refresh();
    }

    async function handleDelete(taskId) {
        await deleteTaskRequest(taskId);
        refresh();
    }

    const canCreate = user.role === 'Admin' || user.role === 'Project Manager';

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px drag to trigger, allows clicking buttons
            },
        })
    );

    function handleDragStart(event) {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        setActiveTask(task);
    }

    async function handleDragEnd(event) {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Is it dropped over a column?
        const isOverColumn = over.data.current?.type === 'Column';
        const isOverTask = over.data.current?.type === 'Task';

        const taskToMove = tasks.find(t => t.id === activeId);
        if (!taskToMove) return;

        let newStatus = taskToMove.status;
        
        if (isOverColumn) {
            newStatus = over.data.current.status;
        } else if (isOverTask) {
            newStatus = over.data.current.task.status;
        }

        if (newStatus && newStatus !== taskToMove.status) {
            handleStatusChange(activeId, newStatus);
        }
    }

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
                        {project ? project.name : 'All Tasks'}
                    </h1>
                    <p className="text-caption" style={{ marginTop: 2 }}>
                        {project ? project.description : "Manage and track your team's work"}
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
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 'var(--space-md)',
                        marginTop: 'var(--space-lg)',
                        alignItems: 'flex-start'
                    }}
                    className="kanban-grid"
                >
                    {COLUMNS.map((col) => {
                        const colTasks = tasks.filter((t) => t.status === col.status);
                        return (
                            <KanbanColumn 
                                key={col.status} 
                                col={col} 
                                tasks={colTasks} 
                                canCreate={canCreate} 
                                handleStatusChange={handleStatusChange} 
                                handleDelete={handleDelete} 
                            />
                        );
                    })}
                </div>
                
                <DragOverlay>
                    {activeTask ? <TaskCard task={activeTask} /> : null}
                </DragOverlay>
            </DndContext>

            {/* Task form modal */}
            {showForm && <TaskForm onClose={() => setShowForm(false)} onCreated={refresh} defaultProjectId={projectId} />}

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
