import { useState, useEffect } from 'react';

export const useCanvasImage = (src: string) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = 'anonymous'; // Handle CORS if needed

        const handleLoad = () => {
            setImage(img);
            setIsLoaded(true);
        };

        if (img.complete) {
            handleLoad();
        } else {
            img.addEventListener('load', handleLoad);
            img.addEventListener('error', (e) => console.error("Error loading image:", src, e));
        }

        return () => {
            img.removeEventListener('load', handleLoad);
        };
    }, [src]);

    return { image, isLoaded };
};
