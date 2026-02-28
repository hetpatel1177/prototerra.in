import { useState, useEffect, useRef, useMemo } from 'react';

export const useImageSequence = (
    basePath: string,
    frameCount: number,
    extension: string = 'jpg',
    step: number = 1
) => {
    // We use a ref for the images array to prevent 80+ re-renders during loading.
    // The canvas draw loop will read from this ref values.
    const imagesRef = useRef<HTMLImageElement[]>([]);

    // We track loaded count in a ref to check thresholds, but use state for UI/Progress bar
    const [loadedCount, setLoadedCount] = useState(0);
    const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
    const startedLoadingRef = useRef(false);

    useEffect(() => {
        // Reset count on mount/unmount
        let count = 0;
        const imgs: HTMLImageElement[] = [];

        // 1. Initial Priority Frame
        const firstImg = new Image();
        const firstPaddedIndex = (1).toString().padStart(3, '0');
        firstImg.src = `${basePath}${firstPaddedIndex}.${extension}`;

        firstImg.onload = () => {
            setFirstFrameLoaded(true);
            count++;
            setLoadedCount(1);

            // 2. Load the rest after a short delay to prioritize the first frame's paint
            if (!startedLoadingRef.current) {
                startedLoadingRef.current = true;
                setTimeout(loadRemaining, 300);
            }
        };
        imgs[0] = firstImg;
        imagesRef.current = imgs;

        const loadRemaining = async () => {
            // Load in batches of 8 to avoid saturating mobile network connections
            const batchSize = 8;
            for (let i = 2; i <= frameCount; i += batchSize) {
                const batchPromises = [];
                for (let j = i; j < i + batchSize && j <= frameCount; j++) {
                    batchPromises.push(new Promise<void>((resolve) => {
                        const img = new Image();
                        const actualIndex = (j - 1) * step + 1;
                        const paddedIndex = actualIndex.toString().padStart(3, '0');
                        img.src = `${basePath}${paddedIndex}.${extension}`;

                        img.onload = () => {
                            count++;
                            // Throttled progress: Only update UI state every 10 frames 
                            // to keep the main thread smooth on mobile devices.
                            if (count % 10 === 0 || count === frameCount) {
                                setLoadedCount(count);
                            }
                            resolve();
                        };
                        img.onerror = () => {
                            count++;
                            resolve();
                        };
                        // Store in ref immediately so the canvas can pick it up
                        imagesRef.current[j - 1] = img;
                    }));
                }
                await Promise.all(batchPromises);
                // Tiny breathing room
                await new Promise(r => setTimeout(r, 20));
            }
        };

        return () => {
            // Cleanup logic if needed
        };
    }, [basePath, frameCount, extension, step]);

    const progress = frameCount === 0 ? 0 : loadedCount / frameCount;

    return {
        images: imagesRef.current,
        progress,
        isLoaded: loadedCount === frameCount,
        firstFrameLoaded
    };
};
