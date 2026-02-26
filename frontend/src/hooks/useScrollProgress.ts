import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { RefObject } from 'react';

export const useScrollProgress = (
    containerRef: RefObject<HTMLElement | null>
): MotionValue<number> => {
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'], // Tracks from top of container at top of viewport to bottom of container at bottom of viewport
    });

    return scrollYProgress;
};
