'use client';
import Link from 'next/link';
import { ShoppingCart, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { data: session } = useSession();
    const { cartCount } = useCart();
    const router = useRouter();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
            setIsMobileMenuOpen(false); // Close mobile menu on search
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 w-full z-50 px-4 md:px-6 py-4 md:py-6 flex justify-between items-center bg-black/50 backdrop-blur-md border-b border-white/5 transition-all duration-300 text-pt-text">
            {/* Left: Logo & Links */}
            <div className="flex items-center gap-4 md:gap-12">
                <button
                    className="md:hidden block text-pt-secondary hover:text-pt-text transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <Link href="/" className="font-bold text-lg md:text-xl tracking-widest flex items-center gap-3 group">
                    <div className="relative w-8 h-8 transition-transform group-hover:scale-110 duration-300">
                        <Image
                            src="/logo.png"
                            alt="ProtoTerra Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span>PROTOTERRA</span>
                </Link>

                <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide text-pt-secondary">
                    <Link href="/" className="hover:text-pt-text transition-colors">HOME</Link>
                    <Link href="/collections" className="hover:text-pt-text transition-colors">COLLECTIONS</Link>
                    <Link href="/our-story" className="hover:text-pt-text transition-colors">OUR STORY</Link>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4 md:gap-6">
                <Link href="/search" className="md:hidden relative group" aria-label="Search artifacts">
                    <Search className="w-6 h-6 text-pt-secondary group-hover:text-pt-text transition-colors" />
                </Link>

                <form onSubmit={handleSearch} className="relative hidden md:block group">
                    <Search className="w-5 h-5 text-pt-secondary group-hover:text-pt-text transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search artifacts..."
                        className="bg-zinc-900/50 border border-zinc-800 rounded-full pl-10 pr-4 py-1.5 text-sm text-pt-text placeholder:text-zinc-400 focus:outline-none focus:border-pt-clay w-64 transition-all"
                    />
                </form>

                <Link href="/cart" className="relative group" aria-label="View shopping cart">
                    <ShoppingCart className="w-6 h-6 text-pt-secondary group-hover:text-pt-text transition-colors" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-pt-clay text-pt-bg text-[10px] font-bold flex items-center justify-center rounded-full">
                            {cartCount}
                        </span>
                    )}
                </Link>

                {session ? (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 hover:border-pt-clay transition-colors relative"
                        >
                            {session.user?.image ? (
                                <Image src={session.user.image} alt={session.user.name || 'User'} fill sizes="32px" className="object-cover" />
                            ) : (
                                <span className="text-xs font-bold text-pt-clay relative z-10">
                                    {(session.user?.email?.[0] || session.user?.name?.[0] || 'U').toUpperCase()}
                                </span>
                            )}
                        </button>

                        {isUserMenuOpen && (
                            <div className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-sm shadow-xl p-2 z-50">
                                <div className="px-3 py-2 text-xs text-zinc-500 border-b border-zinc-800 mb-2 overflow-hidden text-ellipsis">
                                    {session.user?.email}
                                </div>
                                <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-zinc-800 rounded-sm mb-1">
                                    My Account
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 rounded-sm flex items-center gap-2 text-red-400"
                                >
                                    <LogOut className="w-3 h-3" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login" className="relative group" aria-label="Login to your account">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 hover:border-pt-clay transition-colors">
                            <User className="w-5 h-5 text-pt-secondary" />
                        </div>
                    </Link>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-900 flex flex-col items-center py-6 px-4 md:hidden gap-6 shadow-2xl">
                    <form onSubmit={handleSearch} className="relative w-full max-w-sm group">
                        <Search className="w-5 h-5 text-pt-secondary group-hover:text-pt-text transition-colors absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search artifacts..."
                            className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-pt-text placeholder:text-zinc-400 focus:outline-none focus:border-pt-clay w-full transition-all"
                        />
                    </form>
                    <div className="flex flex-col items-center gap-4 text-sm font-medium tracking-wide text-pt-secondary">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pt-text transition-colors">HOME</Link>
                        <Link href="/collections" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pt-text transition-colors">COLLECTIONS</Link>
                        <Link href="/our-story" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-pt-text transition-colors">OUR STORY</Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
