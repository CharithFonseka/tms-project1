
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserRequest, updateUserRequest } from '../../api/usersApi';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    role: z.enum(['Admin', 'Project Manager', 'Collaborator']),
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
            // map backend field-level errors onto the matching input
            if (err.code === 409) {
                setError('email', { message: err.message });
            } else {
                setError('root', { message: err.message || 'Something went wrong' });
            }
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {errors.root && <p className="rounded bg-red-50 p-2 text-sm text-red-600">{errors.root.message}</p>}

            <div>
                <input {...register('name')} placeholder="Full name" className="w-full rounded border border-slate-300 px-3 py-2" />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>
            <div>
                <input {...register('email')} placeholder="Email" className="w-full rounded border border-slate-300 px-3 py-2" />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
                <select {...register('role')} className="w-full rounded border border-slate-300 px-3 py-2">
                    <option value="Admin">Admin</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Collaborator">Collaborator</option>
                </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">
                {existingUser ? 'Save changes' : 'Create user'}
            </button>
        </form>
    );
}