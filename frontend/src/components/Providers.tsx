'use client';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/context/CartContext';
import { LazyMotion, domMax } from 'framer-motion';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <CartProvider>
                <LazyMotion features={domMax}>
                    {children}
                </LazyMotion>
            </CartProvider>
        </SessionProvider>
    );
}
