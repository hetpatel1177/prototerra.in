'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useImageSequence } from '@/hooks/useImageSequence';
import { drawHero } from '@/lib/draw';
import { clsx } from 'clsx';

export default function HeroDepth() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Load Sequence
    // Frame count: 160, Path: /assets/ezgif-frame-XXX.png
    const { images, progress: loadProgress } = useImageSequence('/assets/ezgif-frame-', 160, 'png');

    // Scroll Progress: 0 -> 1 based on container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // Smooth the progress for text animations ONLY. 
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

    // Text Transforms
    const textY = useTransform(smoothProgress, [0, 1], [0, -100]); // Drift up

    // Opacity for phases
    const introOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
    const layerOpacity = useTransform(smoothProgress, [0.2, 0.35, 0.4], [0, 1, 0]);
    const algoOpacity = useTransform(smoothProgress, [0.45, 0.55, 0.6], [0, 1, 0]);
    const fireOpacity = useTransform(smoothProgress, [0.65, 0.75], [0, 1]);

    // Canvas Resize & Draw Loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || images.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const render = () => {
            const progress = scrollYProgress.get();

            // Calculate current frame index
            // Map 0-1 to 0-159
            const frameIndex = Math.min(
                159,
                Math.max(0, Math.floor(progress * 159))
            );

            const currentImage = images[frameIndex];

            // Handle Resize
            const { innerWidth, innerHeight } = window;
            if (canvas.width !== innerWidth || canvas.height !== innerHeight) {
                canvas.width = innerWidth;
                canvas.height = innerHeight;
            }

            // Draw (Standard draw, no blur simulation needed if frames have it)
            if (currentImage && currentImage.complete) {
                // We pass 'true' to disable effects (scale/blur) as sequence has it
                drawHero(ctx, currentImage, 0, canvas.width, canvas.height, true);
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [images, scrollYProgress]);

    return (
        <section ref={containerRef} className="relative h-[300vh] bg-pt-bg">
            {/* Sticky Canvas Container */}
            <div className="sticky top-0 h-screen w-full overflow-hidden">

                {/* Loading Indicator */}
                {loadProgress < 1 && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-pt-bg">
                        <span className="text-pt-secondary text-xs tracking-widest">
                            LOADING {(loadProgress * 100).toFixed(0)}%
                        </span>
                    </div>
                )}

                {/* Canvas */}
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                />

                {/* Text Overlays */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">

                    {/* Phase 1: Intro */}
                    <motion.div style={{ opacity: introOpacity, y: textY }} className="text-center">
                        <h1 className="text-5xl md:text-8xl font-light tracking-widest text-pt-text uppercase">
                            ProtoTerra
                        </h1>
                        <p className="mt-4 text-sm md:text-base text-pt-secondary tracking-[0.2em] font-light">
                            Technology shaped by Earth
                        </p>
                    </motion.div>

                    {/* Phase 2: Layer by layer */}
                    <motion.div style={{ opacity: layerOpacity }} className="absolute text-center">
                        <p className="text-2xl md:text-4xl text-pt-text font-light tracking-wide">
                            Layer by layer
                        </p>
                    </motion.div>

                    {/* Phase 3: Algorithm */}
                    <motion.div style={{ opacity: algoOpacity }} className="absolute text-center">
                        <p className="text-2xl md:text-4xl text-pt-text font-light tracking-wide">
                            Guided by algorithm
                        </p>
                    </motion.div>

                    {/* Phase 4: Fire */}
                    <motion.div style={{ opacity: fireOpacity }} className="absolute text-center">
                        <p className="text-2xl md:text-4xl text-pt-text font-light tracking-wide">
                            Finished by fire
                        </p>
                    </motion.div>

                </div>

                {/* Scroll Indicator */}
                <motion.div
                    style={{ opacity: introOpacity }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <div className="w-[1px] h-12 bg-pt-secondary/30 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-pt-clay animate-scroll-down" />
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-pt-secondary">Scroll</span>
                </motion.div>

            </div>
        </section>
    );
}
