'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard, Package, ShoppingCart, Users,
    Settings, HelpCircle, BarChart3, LogOut, Layers, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Products', href: '/products', icon: Package },
    { title: 'Collections', href: '/collections', icon: Layers },
    { title: 'Orders', href: '/orders', icon: ShoppingCart },
    { title: 'Customers', href: '/customers', icon: Users },
    { title: 'Pages', href: '/pages', icon: Layers },
    { title: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const configNav = [
    { title: 'Settings', href: '/settings', icon: Settings },
    { title: 'Support', href: '/support', icon: HelpCircle },
];

function NavItem({ href, icon: Icon, title, active, onClick }: {
    href: string; icon: React.ElementType; title: string; active: boolean; onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 rounded-sm border-l-2',
                active
                    ? 'border-[#C47A2C] bg-[rgba(196,122,44,0.10)] text-[#C47A2C]'
                    : 'border-transparent text-[#9A9A9A] hover:text-[#F5F5F5] hover:bg-white/[0.04] hover:border-white/10'
            )}
        >
            <Icon className={cn('h-4 w-4 flex-shrink-0 transition-colors', active ? 'text-[#C47A2C]' : 'text-[#9A9A9A] group-hover:text-[#F5F5F5]')} />
            <span className="tracking-wide">{title}</span>
        </Link>
    );
}

export function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (v: boolean) => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const initials = session?.user?.name
        ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : 'A';

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{
                background: '#0e0e0e',
                borderRight: '1px solid #1f1f1f',
            }}
        >
            {/* Top */}
            <div className="flex flex-col gap-6 pt-6 px-4">

                {/* Logo */}
                <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-7 w-7 items-center justify-center rounded-sm text-xs font-black tracking-widest"
                            style={{ background: '#C47A2C', color: '#050505' }}
                        >
                            PT
                        </div>
                        <span className="text-sm font-bold tracking-[0.15em] uppercase text-[#F5F5F5]">
                            ProtoTerra
                        </span>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        className="md:hidden text-[#9A9A9A] hover:text-[#F5F5F5]"
                        onClick={() => setIsOpen?.(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: '#1f1f1f' }} />

                {/* Main nav */}
                <nav className="flex flex-col gap-0.5">
                    <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]/60">
                        Main
                    </p>
                    {mainNav.map(item => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            title={item.title}
                            active={pathname === item.href}
                            onClick={() => setIsOpen?.(false)}
                        />
                    ))}
                </nav>

                {/* Divider */}
                <div style={{ height: '1px', background: '#1f1f1f' }} />

                {/* Config nav */}
                <nav className="flex flex-col gap-0.5">
                    <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A9A9A]/60">
                        System
                    </p>
                    {configNav.map(item => (
                        <NavItem
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                            title={item.title}
                            active={pathname === item.href}
                            onClick={() => setIsOpen?.(false)}
                        />
                    ))}
                </nav>
            </div>

            {/* Bottom — user + sign out */}
            <div className="px-4 pb-6 flex flex-col gap-2">
                <div style={{ height: '1px', background: '#1f1f1f', marginBottom: '12px' }} />

                {/* User card */}
                <div
                    className="flex items-center gap-3 rounded-sm px-3 py-2.5"
                    style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                >
                    <div
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm text-xs font-bold"
                        style={{ background: 'rgba(196,122,44,0.15)', color: '#C47A2C' }}
                    >
                        {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-[#F5F5F5] truncate">
                            {session?.user?.name ?? 'Admin'}
                        </span>
                        <span className="text-[10px] text-[#9A9A9A] truncate">
                            {session?.user?.email ?? ''}
                        </span>
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
                    className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium text-[#9A9A9A] transition-all duration-150 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="tracking-wide">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
