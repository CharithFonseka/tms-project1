
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

    async function onSubmit(values) {
        setServerError('');
        try {
            const user = await login(values.email, values.password);
            if (user.mustResetPassword) {
                navigate('/reset-password');
            } else if (user.role === 'Admin') {
                navigate('/users');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setServerError(err.message || 'Login failed');
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
                <h1 className="mb-6 text-2xl font-semibold text-slate-900">Sign in</h1>
                {serverError && (
                    <p className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{serverError}</p>
                )}
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                <input id="email" {...register('email')} className="mb-1 w-full rounded border border-slate-300 px-3 py-2" />
                {errors.email && <p className="mb-3 text-sm text-red-600">{errors.email.message}</p>}

                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input id="password" type="password" {...register('password')} className="mb-1 w-full rounded border border-slate-300 px-3 py-2" />
                {errors.password && <p className="mb-3 text-sm text-red-600">{errors.password.message}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full rounded bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Signing in…' : 'Sign in'}
                </button>
            </form>
        </div>
    );
}