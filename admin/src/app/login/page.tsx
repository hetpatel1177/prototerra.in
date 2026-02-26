'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError('Invalid email or password. Please try again.');
        } else {
            router.push('/');
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background glow orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-800/10 blur-[100px] pointer-events-none" />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '48px 48px',
                }}
            />

            <div className="relative w-full max-w-md">

                {/* Card */}
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/60 p-8 space-y-8">

                    {/* Logo + title */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600/15 border border-amber-500/20 mb-2">
                            <ShieldCheck className="w-7 h-7 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white">ProtoTerra Admin</h1>
                            <p className="text-sm text-white/40 mt-1">Sign in to access your dashboard</p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@prototerra.in"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-widest text-white/50">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-white/20">
                        Restricted access · ProtoTerra Internal
                    </p>
                </div>

                {/* Bottom label */}
                <p className="text-center text-xs text-white/15 mt-6">
                    © {new Date().getFullYear()} ProtoTerra. All rights reserved.
                </p>
            </div>
        </div>
    );
}
