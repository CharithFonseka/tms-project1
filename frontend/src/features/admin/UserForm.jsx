import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserRequest, updateUserRequest } from '../../api/usersApi';

const schema = z.object({
    name:  z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    role:  z.enum(['Admin', 'Project Manager', 'Collaborator']),
});

export default function UserForm({ existingUser, onSuccess }) {
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: existingUser || { name: '', email: '', role: 'Collaborator' },
    });

    async function onSubmit(values) {
        try {
            const result = existingUser
                ? await updateUserRequest(existingUser.id, values)
                : await createUserRequest(values);
            onSuccess(result);
        } catch (err) {
            if (err.code === 409) {
                setError('email', { message: err.message });
            } else {
                setError('root', { message: err.message || 'Something went wrong' });
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                    <span style={{ flexShrink: 0, fontWeight: 600 }}>✕</span>
                    <span>{errors.root.message}</span>
                </div>
            )}

            <div style={{ marginBottom: 12 }}>
                <label className="field-label">Full name</label>
                <input
                    {...register('name')}
                    placeholder="Jane Smith"
                    className={`input-field${errors.name ? ' input-error' : ''}`}
                />
                {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            <div style={{ marginBottom: 12 }}>
                <label className="field-label">Email</label>
                <input
                    {...register('email')}
                    placeholder="jane@example.com"
                    className={`input-field${errors.email ? ' input-error' : ''}`}
                />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: 24 }}>
                <label className="field-label">Role</label>
                <select {...register('role')} className="input-field">
                    <option value="Admin">Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Collaborator">Collaborator</option>
                </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {existingUser ? 'Save changes' : 'Create user'}
                </button>
            </div>
        </form>
    );
}