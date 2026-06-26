import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTaskRequest } from '../../api/tasksApi';
import { listUsersRequest } from '../../api/usersApi';
import { useEffect, useState } from 'react';

const schema = z.object({
    title:     z.string().min(1, 'Title is required'),
    due_date:  z.string().min(1, 'Due date is required'),
    priority:  z.enum(['Low', 'Medium', 'High']),
    assignees: z.array(z.string()).min(1, 'Select at least one assignee'),
});

export default function TaskForm({ onClose, onCreated, defaultProjectId }) {
    const [users, setUsers] = useState([]);
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { priority: 'Medium', assignees: [] },
    });

    useEffect(() => { listUsersRequest({}).then((res) => setUsers(res.data)); }, []);

    function toggleAssignee(id) {
        const current = watch('assignees');
        setValue(
            'assignees',
            current.includes(id) ? current.filter((a) => a !== id) : [...current, id],
        );
    }

    async function onSubmit(values) {
        if (defaultProjectId) {
            values.project_id = defaultProjectId;
        }
        await createTaskRequest(values);
        onCreated();
        onClose();
    }

    const selectedAssignees = watch('assignees');

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="card-elevated"
                style={{ width: '100%', maxWidth: 520 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 24,
                    }}
                >
                    <h2 className="text-card-title">New Task</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-icon"
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M13 1 1 13M1 1l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Title */}
                    <div style={{ marginBottom: 12 }}>
                        <label className="field-label">Title</label>
                        <input
                            {...register('title')}
                            placeholder="Task title"
                            className={`input-field${errors.title ? ' input-error' : ''}`}
                        />
                        {errors.title && <p className="field-error">{errors.title.message}</p>}
                    </div>

                    {/* Due date + Priority — two columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <div>
                            <label className="field-label">Due date</label>
                            <input
                                type="date"
                                {...register('due_date')}
                                className={`input-field${errors.due_date ? ' input-error' : ''}`}
                            />
                            {errors.due_date && <p className="field-error">{errors.due_date.message}</p>}
                        </div>
                        <div>
                            <label className="field-label">Priority</label>
                            <select {...register('priority')} className="input-field">
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                    </div>

                    {/* Assignees */}
                    <div style={{ marginBottom: 24 }}>
                        <label className="field-label">
                            Assignees
                            {selectedAssignees.length > 0 && (
                                <span
                                    className="badge-pill"
                                    style={{ marginLeft: 8, verticalAlign: 'middle' }}
                                >
                                    {selectedAssignees.length} selected
                                </span>
                            )}
                        </label>
                        <div
                            style={{
                                maxHeight: 160,
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                borderRadius: 'var(--rounded-xs)',
                                padding: '4px 0',
                            }}
                        >
                            {users.map((u) => (
                                <label key={u.id} className="checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={selectedAssignees.includes(u.id)}
                                        onChange={() => toggleAssignee(u.id)}
                                    />
                                    <span className="text-body-sm">{u.name}</span>
                                    <span className="text-caption" style={{ marginLeft: 'auto' }}>
                                        {u.role}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.assignees && <p className="field-error">{errors.assignees.message}</p>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn-utility">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                            {isSubmitting ? 'Creating…' : 'Create task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
