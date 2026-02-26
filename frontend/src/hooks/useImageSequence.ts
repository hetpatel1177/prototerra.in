import { useState, useEffect } from 'react';

export const useImageSequence = (
    basePath: string,
    frameCount: number,
    extension: string = 'jpg'
) => {
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [loadedCount, setLoadedCount] = useState(0);

    useEffect(() => {
        const imgs: HTMLImageElement[] = [];
        let loadCounter = 0;

        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            // Pad with zeros: 1 -> 001, 10 -> 010, 100 -> 100
            const paddedIndex = i.toString().padStart(3, '0');
            img.src = `${basePath}${paddedIndex}.${extension}`;

            img.onload = () => {
                loadCounter++;
                setLoadedCount(loadCounter);
            };

            // Even if error, we count it to avoid blocking (placeholder or skip)
            img.onerror = () => {
                console.error(`Failed to load frame ${i}`);
                loadCounter++;
                setLoadedCount(loadCounter);
            };

            imgs.push(img);
        }

        setImages(imgs);

        // Cleanup: we generally want to keep them in memory for this page, 
        // but if we unmount we could nullify references.
        return () => {
            setImages([]);
        };
    }, [basePath, frameCount, extension]);

    const progress = frameCount === 0 ? 0 : loadedCount / frameCount;

    return { images, progress, isLoaded: loadedCount === frameCount };
};
