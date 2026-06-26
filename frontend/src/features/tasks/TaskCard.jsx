import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/* Priority badge classes — sticker palette, decoration only (design.md) */
const PRIORITY_CLS = {
    Low:    'badge-pill badge-priority-low',
    Medium: 'badge-pill badge-priority-medium',
    High:   'badge-pill badge-priority-high',
};

const NEXT_STATUS = {
    'To Do':       'In Progress',
    'In Progress': 'Completed',
    'Completed':   null,
};

function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });
    } catch {
        return dateStr;
    }
}

export default function TaskCard({ task, onStatusChange, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { type: 'Task', task }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        padding: 'var(--space-md)',
        boxShadow: isDragging ? 'var(--shadow-elevated)' : 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: 'var(--color-surface)',
        position: 'relative',
        zIndex: isDragging ? 100 : 1,
    };

    const next = NEXT_STATUS[task.status];

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="card"
        >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <h3
                    style={{
                        fontSize: 15,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        color: 'var(--color-ink)',
                        flex: 1,
                    }}
                >
                    {task.title}
                </h3>
                <span className={PRIORITY_CLS[task.priority] ?? 'badge-pill'}>
                    {task.priority}
                </span>
            </div>

            {/* Due date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {/* Calendar icon */}
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}>
                    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M1 7h14M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="text-caption">Due {formatDate(task.due_date)}</span>
            </div>

            {/* Action row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                {next && (
                    <button
                        className="btn-utility"
                        style={{ fontSize: 12, padding: '3px 10px' }}
                        onPointerDown={(e) => e.stopPropagation()} // prevent drag on button click
                        onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(task.id, next);
                        }}
                    >
                        → {next}
                    </button>
                )}
                {onDelete && (
                    <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(task.id);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: 'var(--color-error)',
                            padding: '3px 4px',
                            marginLeft: 'auto',
                        }}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
}
