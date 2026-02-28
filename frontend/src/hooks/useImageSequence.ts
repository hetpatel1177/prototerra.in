import { useState, useEffect, useRef } from 'react';

export const useImageSequence = (
    basePath: string,
    frameCount: number,
    extension: string = 'jpg',
    step: number = 1
) => {
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
    const startedLoadingRef = useRef(false);

    useEffect(() => {
        const imgs: HTMLImageElement[] = [];
        let loadCounter = 0;

        // 1. Initial Priority Frame
        const firstImg = new Image();
        const firstPaddedIndex = (1).toString().padStart(3, '0');
        firstImg.src = `${basePath}${firstPaddedIndex}.${extension}`;
        firstImg.onload = () => {
            setFirstFrameLoaded(true);
            loadCounter++;
            setLoadedCount(prev => prev + 1);

            // 2. Load the rest after the initial paint to avoid blocking
            // Using a short timeout or just after the first frame
            if (!startedLoadingRef.current) {
                startedLoadingRef.current = true;
                // Wait slightly before starting the "firehose" of images
                setTimeout(loadRemaining, 300);
            }
        };
        imgs[0] = firstImg;

        const loadRemaining = async () => {
            // Load in batches of 10 to avoid saturating network connections
            const batchSize = 10;
            for (let i = 2; i <= frameCount; i += batchSize) {
                const batchPromises = [];
                for (let j = i; j < i + batchSize && j <= frameCount; j++) {
                    batchPromises.push(new Promise<void>((resolve) => {
                        const img = new Image();
                        // Map frame index based on step
                        const actualIndex = (j - 1) * step + 1;
                        const paddedIndex = actualIndex.toString().padStart(3, '0');
                        img.src = `${basePath}${paddedIndex}.${extension}`;

                        img.onload = () => {
                            setLoadedCount(prev => prev + 1);
                            resolve();
                        };
                        img.onerror = () => {
                            console.error(`Failed to load frame ${actualIndex}`);
                            setLoadedCount(prev => prev + 1);
                            resolve();
                        };
                        imgs[j - 1] = img;
                    }));
                }
                await Promise.all(batchPromises);
                await new Promise(r => setTimeout(r, 20));
            }
        };

        setImages(imgs);

        return () => {
            // We don't reset startedLoadingRef on small re-renders, 
            // only on full unmount if needed.
        };
    }, [basePath, frameCount, extension]);

    const progress = frameCount === 0 ? 0 : loadedCount / frameCount;

    return { images, progress, isLoaded: loadedCount === frameCount, firstFrameLoaded };
};
