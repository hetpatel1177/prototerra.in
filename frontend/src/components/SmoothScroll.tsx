'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { LenisContext } from '@/hooks/useLenis';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Force browser to not automatically restore scroll position on navigation
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
        });

        setLenis(lenisInstance);

        function raf(time: number) {
            lenisInstance.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenisInstance.destroy();
        };
    }, []);

    // Reset scroll position to top whenever pathname changes
    useEffect(() => {
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        }
        window.scrollTo(0, 0);
    }, [pathname, lenis]);

    return (
        <LenisContext.Provider value={lenis}>
            {children}
        </LenisContext.Provider>
    );
}
