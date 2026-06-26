
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { resetPasswordRequest } from '../../api/authApi';
import Input from '../../components/Input';
import Button from '../../components/Button';

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
        <div className="flex-center gradient-bg" style={{ minHeight: '100vh', padding: '20px' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '24rem', padding: '40px 32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 className="text-2xl font-bold gradient-text" style={{ marginBottom: '8px' }}>Set a New Password</h1>
                    <p className="text-sm text-secondary">You must reset your password before continuing.</p>
                </div>

                {serverError && (
                    <div className="glass-card text-danger text-sm" style={{ padding: '12px', marginBottom: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        {serverError}
                    </div>
                )}

                <Input
                    label="Current (Temporary) Password"
                    id="oldPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('oldPassword')}
                    error={errors.oldPassword?.message}
                />

                <Input
                    label="New Password"
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('newPassword')}
                    error={errors.newPassword?.message}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ width: '100%', marginTop: '16px' }}
                >
                    {isSubmitting ? 'Updating…' : 'Update Password'}
                </Button>
            </form>
        </div>
    );
}