'use client';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
            callbackUrl: '/'
        });

        if (res?.error) {
            if (res.error.includes('User not found')) {
                setError('User not found. Please sign up first.');
            } else {
                setError('Invalid credentials. Please check your email and password.');
            }
        } else if (res?.ok) {
            router.push('/');
        }
    };

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <Link href="/" className="font-bold tracking-widest flex items-center justify-center gap-2 mb-8">
                        <div className="w-5 h-5 bg-pt-clay rounded-sm inline-block"></div>
                        PROTOTERRA
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-pt-secondary text-sm">Sign in to your account</p>
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
                        Sign in with Google
                    </button>
                </div>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-pt-bg px-2 text-zinc-500">Or continue with</span>
                    </div>
                </div>

                <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-sm text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">Email address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="block text-xs uppercase tracking-wider text-zinc-500">Password</label>
                            <Link href="/forgot-password" className="text-xs text-pt-clay hover:text-white transition-colors">Forgot Password?</Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-3 focus:outline-none focus:border-pt-clay transition-colors"
                        />
                    </div>
                    <button className="w-full bg-pt-clay text-pt-bg font-bold py-3 uppercase tracking-wider hover:bg-white transition-colors">
                        Sign In
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-zinc-500">
                    Don't have an account? <Link href="/signup" className="text-pt-clay hover:text-white transition-colors">Sign up</Link>
                </p>
            </div>
        </main>
    );
}
