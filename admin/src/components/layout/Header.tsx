'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell, Search, ShoppingBag, X, ExternalLink, Menu } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/formatPrice';

const STORAGE_KEY = 'pt_admin_last_seen';
const POLL_INTERVAL = 30_000; // 30 s

interface NewOrder {
    _id: string;
    orderNumber: string;
    customer: { firstName: string; lastName: string };
    total: number;
    createdAt: string;
    status: string;
}

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
    const [notifications, setNotifications] = useState<NewOrder[]>([]);
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);
    const lastSeenRef = useRef<string>(
        typeof window !== 'undefined'
            ? (localStorage.getItem(STORAGE_KEY) ?? new Date(0).toISOString())
            : new Date(0).toISOString()
    );

    const fetchNew = useCallback(async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/orders/new?since=${encodeURIComponent(lastSeenRef.current)}`
            );
            const data = await res.json();
            if (data.success && data.count > 0) {
                setNotifications(data.data);
            }
        } catch {
            // silently ignore network errors
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchNew();
        const id = setInterval(fetchNew, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [fetchNew]);

    // Close panel on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    function markAllRead() {
        const now = new Date().toISOString();
        lastSeenRef.current = now;
        localStorage.setItem(STORAGE_KEY, now);
        setNotifications([]);
        setOpen(false);
    }

    const count = notifications.length;

    return (
        <header
            className="flex h-14 items-center justify-between px-4 md:px-6 shrink-0"
            style={{ background: '#0e0e0e', borderBottom: '1px solid #1f1f1f' }}
        >
            {/* Left Box */}
            <div className="flex items-center gap-3 w-full md:w-72">
                <button
                    className="md:hidden text-[#9A9A9A] hover:text-[#F5F5F5] transition-colors"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </button>
                {/* Search */}
                <div className="relative flex-1 md:w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9A9A9A]" />
                    <input
                        type="search"
                        placeholder="Search orders, products..."
                        className="w-full rounded-sm pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder:text-[#9A9A9A]/50 outline-none transition-all"
                        style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                        onFocus={e => (e.currentTarget.style.borderColor = 'rgba(196,122,44,0.5)')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#1f1f1f')}
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Live indicator */}
                <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest uppercase text-[#9A9A9A]">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C47A2C] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C47A2C]" />
                    </span>
                    Live
                </div>

                <div className="h-4 w-px" style={{ background: '#1f1f1f' }} />

                {/* Notification bell */}
                <div className="relative" ref={panelRef}>
                    <button
                        onClick={() => setOpen(v => !v)}
                        className="relative flex h-8 w-8 items-center justify-center rounded-sm text-[#9A9A9A] transition-colors hover:text-[#F5F5F5] hover:bg-white/[0.05]"
                        style={{ border: '1px solid #1f1f1f' }}
                        aria-label="Notifications"
                    >
                        <Bell className="h-3.5 w-3.5" />

                        {/* Count badge */}
                        {count > 0 && (
                            <span
                                className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none"
                                style={{ background: '#C47A2C', color: '#050505' }}
                            >
                                {count > 99 ? '99+' : count}
                            </span>
                        )}
                    </button>

                    {/* Dropdown panel */}
                    {open && (
                        <div
                            className="absolute right-0 top-10 z-50 w-80 rounded-sm shadow-2xl overflow-hidden"
                            style={{
                                background: '#111111',
                                border: '1px solid #2a2a2a',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                            }}
                        >
                            {/* Panel header */}
                            <div
                                className="flex items-center justify-between px-4 py-3"
                                style={{ borderBottom: '1px solid #1f1f1f' }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">
                                        New Orders
                                    </span>
                                    {count > 0 && (
                                        <span
                                            className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                                            style={{ background: 'rgba(196,122,44,0.15)', color: '#C47A2C' }}
                                        >
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {count > 0 && (
                                        <button
                                            onClick={markAllRead}
                                            className="text-[10px] text-[#9A9A9A] hover:text-[#C47A2C] transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="text-[#9A9A9A] hover:text-[#F5F5F5] transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Order list */}
                            <div className="max-h-80 overflow-y-auto">
                                {count === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-[#9A9A9A]">
                                        <ShoppingBag className="h-8 w-8 opacity-30" />
                                        <p className="text-xs">No new orders</p>
                                    </div>
                                ) : (
                                    notifications.map(order => (
                                        <Link
                                            key={order._id}
                                            href={`/orders/${order._id}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] group"
                                            style={{ borderBottom: '1px solid #1a1a1a' }}
                                        >
                                            {/* Icon */}
                                            <div
                                                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-sm"
                                                style={{ background: 'rgba(196,122,44,0.12)' }}
                                            >
                                                <ShoppingBag className="h-3.5 w-3.5 text-[#C47A2C]" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs font-semibold text-[#F5F5F5] truncate">
                                                        {order.customer.firstName} {order.customer.lastName}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-[#C47A2C] flex-shrink-0">
                                                        {formatPrice(order.total)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-0.5">
                                                    <span className="text-[10px] text-[#9A9A9A] font-mono">
                                                        #{order.orderNumber}
                                                    </span>
                                                    <span className="text-[10px] text-[#9A9A9A]">
                                                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <ExternalLink className="h-3 w-3 text-[#9A9A9A] opacity-0 group-hover:opacity-100 flex-shrink-0 mt-1 transition-opacity" />
                                        </Link>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            {count > 0 && (
                                <div style={{ borderTop: '1px solid #1f1f1f' }}>
                                    <Link
                                        href="/orders"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-center gap-1.5 py-3 text-[11px] font-medium text-[#9A9A9A] hover:text-[#C47A2C] transition-colors"
                                    >
                                        View all orders
                                        <ExternalLink className="h-3 w-3" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
