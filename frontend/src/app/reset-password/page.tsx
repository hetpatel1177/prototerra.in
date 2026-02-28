'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage('Your password has been successfully reset.');
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to reset password');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-red-500 mb-4">Invalid or missing reset token.</p>
                <Link href="/login" className="text-pt-clay hover:text-white transition-colors">Return to Login</Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-4">Set New Password</h1>
                <p className="text-pt-secondary text-sm">
                    Enter your new password below.
                </p>
            </div>

            {status === 'success' ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-sm text-center">
                    <p className="mb-4">{message}</p>
                    <p className="text-sm text-zinc-500">Redirecting to login in 3 seconds...</p>
                    <Link href="/login" className="text-white underline hover:text-pt-clay mt-4 block">
                        Login Now
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {status === 'error' && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-sm text-center">
                            {message}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors text-white"
                            placeholder="•••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors text-white"
                            placeholder="•••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full bg-pt-clay text-pt-bg font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center px-6 pt-28 pb-12">
            <Suspense fallback={<div className="text-pt-clay animate-pulse">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </main>
    );
}
