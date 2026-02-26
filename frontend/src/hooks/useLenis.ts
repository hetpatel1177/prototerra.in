'use client';
import { createContext, useContext } from 'react';
import type Lenis from '@studio-freight/lenis';

export const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => {
    return useContext(LenisContext);
};
