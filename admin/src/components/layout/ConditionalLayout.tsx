'use client';

import { usePathname } from 'next/navigation';
import { AdminLayout } from './AdminLayout';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login';

    if (isAuthPage) return <>{children}</>;

    return <AdminLayout>{children}</AdminLayout>;
}
