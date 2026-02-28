'use client';
import Link from 'next/link';
import { ArrowRight, Instagram, Mail, Globe, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Footer() {
    const [collections, setCollections] = useState<{ name: string; slug: string }[]>([]);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error);
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to subscribe. Please try again.');
        }
    };

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`)
            .then(r => r.json())
            .then(d => { if (d.success) setCollections(d.data.slice(0, 5)); })
            .catch(() => { });
    }, []);
    return (
        <footer className="w-full bg-pt-bg text-pt-text pt-24 pb-12 px-6 md:px-12 border-t border-zinc-900">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">

                {/* Brand */}
                <div className="col-span-1">
                    <Link href="/" className="font-bold text-lg tracking-widest flex items-center gap-2 mb-6">
                        PROTOTERRA
                    </Link>
                    <p className="text-sm text-pt-secondary leading-relaxed max-w-xs">
                        Preserving the ancient craft of clay through contemporary design and artisanal collaboration.
                    </p>
                    <div className="flex gap-4 mt-8">
                        {/* Website: Add your URL below */}
                        <a href="https://prototerra.in" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-pt-secondary hover:text-pt-text hover:bg-zinc-800 transition-all">
                            <Globe className="w-4 h-4" />
                        </a>
                        {/* Email: Add mailto:your@email.com below */}
                        <a href="mailto:admin@prototerra.in" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-pt-secondary hover:text-pt-text hover:bg-zinc-800 transition-all">
                            <Mail className="w-4 h-4" />
                        </a>
                        {/* Instagram: Add your profile URL below */}
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-pt-secondary hover:text-pt-text hover:bg-zinc-800 transition-all">
                            <Instagram className="w-4 h-4" />
                        </a>
                        {/* WhatsApp */}
                        <a href="https://wa.me/917802817800" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-pt-secondary hover:text-pt-text hover:bg-zinc-800 transition-all">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Links: Collections */}
                <div className="col-span-1">
                    <h4 className="text-xs font-bold tracking-widest text-pt-text/80 uppercase mb-6">Collections</h4>
                    <ul className="space-y-4 text-sm text-pt-secondary">
                        {collections.length > 0
                            ? collections.map(c => (
                                <li key={c.slug}>
                                    <Link href={`/collections/${c.slug}`} className="hover:text-pt-clay transition-colors">
                                        {c.name}
                                    </Link>
                                </li>
                            ))
                            : ['Earthware', 'Modern Geometry', 'Heritage'].map(name => (
                                <li key={name}><span className="text-pt-secondary/40">{name}</span></li>
                            ))
                        }
                    </ul>
                </div>

                {/* Links: Company */}
                <div className="col-span-1">
                    <h4 className="text-xs font-bold tracking-widest text-pt-text/80 uppercase mb-6">Company</h4>
                    <ul className="space-y-4 text-sm text-pt-secondary">
                        <li><Link href="/our-story" className="hover:text-pt-clay transition-colors">Our Story</Link></li>
                        <li><Link href="/sustainability" className="hover:text-pt-clay transition-colors">Sustainability</Link></li>
                        <li><Link href="/contact" className="hover:text-pt-clay transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Journal / Newsletter */}
                <div className="col-span-1">
                    <h4 className="text-xs font-bold tracking-widest text-pt-text/80 uppercase mb-6">Journal</h4>
                    <p className="text-sm text-pt-secondary mb-6">
                        Join our inner circle for collection previews and studio updates.
                    </p>
                    <form onSubmit={handleSubscribe} className="relative">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'loading' || status === 'success'}
                            required
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm text-pt-text focus:outline-none focus:border-pt-clay transition-colors disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success' || !email}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-pt-clay hover:text-pt-text transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>
                    {message && (
                        <p className={`text-xs mt-3 ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-pt-secondary/60 uppercase tracking-wider">
                <p>© 2026 ProtoTerra Artisanal Ceramics. All rights reserved.</p>
                <div className="flex gap-8 mt-4 md:mt-0">
                    <Link href="/privacy" className="hover:text-pt-text">Privacy Policy</Link>
                    <Link href="/terms" className="hover:text-pt-text">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
