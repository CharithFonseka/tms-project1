import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';

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
            if (user.reset_required) {
                navigate('/reset-password');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setServerError(err.message || 'Login failed');
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                backgroundColor: 'var(--color-canvas-soft)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-md)',
            }}
        >
            {/* Wordmark above card */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 28,
                }}
            >
                <span
                    style={{
                        width: 36,
                        height: 36,
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 16,
                    }}
                >
                    T
                </span>
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.25px', color: 'var(--color-ink)' }}>
                    TaskFlow
                </span>
            </div>

            {/* Auth card */}
            <div className="card-elevated" style={{ width: '100%', maxWidth: 380 }}>
                {/* Eyebrow */}
                <span className="badge-pill" style={{ marginBottom: 16, display: 'inline-flex' }}>
                    Task Management System
                </span>

                <h1 className="text-card-title" style={{ marginBottom: 24 }}>
                    Sign in
                </h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {serverError && (
                        <div className="alert alert-error" style={{ marginBottom: 16 }}>
                            <span style={{ flexShrink: 0, fontWeight: 600 }}>✕</span>
                            <span>{serverError}</span>
                        </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="email" className="field-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            {...register('email')}
                            className={`input-field${errors.email ? ' input-error' : ''}`}
                            placeholder="you@example.com"
                        />
                        {errors.email && <p className="field-error">{errors.email.message}</p>}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label htmlFor="password" className="field-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            {...register('password')}
                            className={`input-field${errors.password ? ' input-error' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="field-error">{errors.password.message}</p>}
                    </div>

                    <button
                        id="login-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            </div>

            {/* Footer caption */}
            <p className="text-caption" style={{ marginTop: 24 }}>
                Powered by TaskFlow · INTE 21323
            </p>
        </div>
    );
}