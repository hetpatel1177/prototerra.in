'use client';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (data.success) {
                // Auto login or redirect to login
                router.push('/login?registered=true');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <main className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center px-6 pt-28 pb-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <Link href="/" className="font-bold tracking-widest flex items-center justify-center gap-2 mb-8">
                        <div className="w-5 h-5 bg-pt-clay rounded-sm inline-block"></div>
                        PROTOTERRA
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-pt-secondary text-sm">Join the ProtoTerra circle</p>
                </div>

                <div className="space-y-4 mb-8">
                    <button
                        onClick={() => signIn('google', { callbackUrl: '/' })}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium py-3 rounded-sm hover:bg-zinc-200 transition-colors"
                    >
                        {/* Google Icon SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign up with Google
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-pt-bg px-2 text-zinc-500">Or register with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-sm text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors"
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-pt-clay text-pt-bg font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-50">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-500">
                    Already have an account? <Link href="/login" className="text-pt-clay hover:text-white transition-colors">Log in</Link>
                </p>
            </div>
        </main>
    );
}
