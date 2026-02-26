'use client';
import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div
            className="flex h-screen overflow-hidden antialiased relative"
            style={{ background: '#050505', color: '#F5F5F5' }}
        >
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main
                    className="flex-1 overflow-y-auto p-4 md:p-6"
                    style={{ background: '#050505' }}
                >
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
