
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { resetPasswordRequest } from '../../api/authApi';

const schema = z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

    async function onSubmit(values) {
        setServerError('');
        try {
            await resetPasswordRequest(values.oldPassword, values.newPassword);
            navigate('/dashboard');
        } catch (err) {
            setServerError(err.message || 'Reset failed');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
                <h1 className="mb-2 text-2xl font-semibold text-slate-900">Set a new password</h1>
                <p className="mb-6 text-sm text-slate-500">You must reset your password before continuing.</p>
                {serverError && <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{serverError}</p>}

                <label htmlFor="oldPassword" className="mb-1 block text-sm font-medium text-slate-700">Current (temporary) password</label>
                <input id="oldPassword" type="password" {...register('oldPassword')} className="mb-1 w-full rounded border border-slate-300 px-3 py-2" />
                {errors.oldPassword && <p className="mb-3 text-sm text-red-600">{errors.oldPassword.message}</p>}

                <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">New password</label>
                <input id="newPassword" type="password" {...register('newPassword')} className="mb-1 w-full rounded border border-slate-300 px-3 py-2" />
                {errors.newPassword && <p className="mb-3 text-sm text-red-600">{errors.newPassword.message}</p>}

                <button type="submit" disabled={isSubmitting} className="mt-4 w-full rounded bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                    {isSubmitting ? 'Updating…' : 'Update password'}
                </button>
            </form>
        </div>
    );
}