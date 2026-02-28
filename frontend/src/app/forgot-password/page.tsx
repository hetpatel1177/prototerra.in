'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage('If an account exists for this email, you will receive a password reset link shortly.');
            } else {
                throw new Error(data.error || 'Something went wrong');
            }
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center px-6 pt-28 pb-12">
            <div className="w-full max-w-md">
                <Link href="/login" className="flex items-center gap-2 text-xs text-pt-secondary hover:text-white transition-colors mb-8 uppercase tracking-wider">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-4">Reset Password</h1>
                    <p className="text-pt-secondary text-sm leading-relaxed">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-sm text-center">
                        <p className="mb-4">{message}</p>
                        <Link href="/login" className="text-white underline hover:text-pt-clay">
                            Return to Login
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
                            <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors text-white"
                                placeholder="name@example.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-pt-clay text-pt-bg font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
