import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { resetPasswordRequest } from '../../api/authApi';

const schema = z.object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
        .min(8, 'New password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
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
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span
                    style={{
                        width: 36, height: 36,
                        backgroundColor: 'var(--color-primary)',
                        borderRadius: 9,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 16,
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
                {/* Required eyebrow badge */}
                <span
                    className="badge-pill"
                    style={{
                        marginBottom: 16,
                        display: 'inline-flex',
                        backgroundColor: '#fff7ed',
                        color: 'var(--color-accent-orange)',
                        borderColor: 'transparent',
                    }}
                >
                    Action required
                </span>

                <h1 className="text-card-title" style={{ marginBottom: 6 }}>
                    Set your password
                </h1>
                <p className="text-caption" style={{ marginBottom: 24 }}>
                    You must set a permanent password before you can access the system.
                </p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {serverError && (
                        <div className="alert alert-error" style={{ marginBottom: 16 }}>
                            <span style={{ flexShrink: 0, fontWeight: 600 }}>✕</span>
                            <span>{serverError}</span>
                        </div>
                    )}

                    <div style={{ marginBottom: 12 }}>
                        <label htmlFor="oldPassword" className="field-label">
                            Current (temporary) password
                        </label>
                        <input
                            id="oldPassword"
                            type="password"
                            autoComplete="current-password"
                            {...register('oldPassword')}
                            className={`input-field${errors.oldPassword ? ' input-error' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.oldPassword && <p className="field-error">{errors.oldPassword.message}</p>}
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label htmlFor="newPassword" className="field-label">
                            New password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            autoComplete="new-password"
                            {...register('newPassword')}
                            className={`input-field${errors.newPassword ? ' input-error' : ''}`}
                            placeholder="Min. 8 chars, uppercase, number, symbol"
                        />
                        {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
                    </div>

                    <button
                        id="reset-password-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        {isSubmitting ? 'Updating…' : 'Update password'}
                    </button>
                </form>
            </div>

            <p className="text-caption" style={{ marginTop: 24 }}>
                Powered by TaskFlow · INTE 21323
            </p>
        </div>
    );
}