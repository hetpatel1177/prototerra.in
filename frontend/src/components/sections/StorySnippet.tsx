'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function StorySnippet() {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end start']
    });

    // Curvy (entering) -> Straight (in view) -> Curvy (leaving)
    // Using a large pixel value for the curve to ensure it's noticeable but not elliptical
    const borderRadius = useTransform(
        scrollYProgress,
        [0, 0.2, 0.8, 1],
        ['100px', '0px', '0px', '100px']
    );

    return (
        <section ref={containerRef} className="py-24 px-6 md:px-12 bg-pt-bg">
            <motion.div
                style={{ borderRadius }}
                className="flex flex-col md:flex-row gap-12 items-center bg-zinc-900/50 overflow-hidden border border-zinc-800/50"
            >
                <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-[600px] relative">
                    <img src="/assets/our_story_hero_page.png" alt="Potter at work" className="object-cover w-full h-full" />
                </div>

                <div className="w-full md:w-1/2 p-6 md:p-12 lg:p-24">
                    <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-6 block">Our Story</span>
                    <h2 className="text-4xl lg:text-5xl font-black mb-8 flex flex-col items-start gap-2 font-sans tracking-tight">
                        <span className="bg-pt-clay text-pt-bg px-3 py-1.5 leading-none">
                            Born from Dust,
                        </span>
                        <span className="text-white leading-none px-1">
                            Defined by Fire.
                        </span>
                    </h2>
                    <p className="text-pt-secondary leading-relaxed mb-6">
                        Each ProtoTerra piece begins its journey as raw earth from the High Sierra.
                        Our artisans spend weeks hand-burnishing every surface, creating a unique tactile
                        signature that cannot be replicated by machines.
                    </p>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                            <span className="block text-3xl font-bold text-pt-clay mb-1">100%</span>
                            <span className="text-xs text-pt-secondary uppercase tracking-wider">Natural Materials</span>
                        </div>
                        <div>
                            <span className="block text-3xl font-bold text-pt-clay mb-1">24h+</span>
                            <span className="text-xs text-pt-secondary uppercase tracking-wider">Hand Polishing</span>
                        </div>
                    </div>

                    <Link href="/our-story" className="inline-block border-b border-white pb-1 text-sm uppercase tracking-wider hover:text-pt-clay hover:border-pt-clay transition-colors">
                        Read Our Full Story
                    </Link>
                </div>
            </motion.div>
        </section>
    );
}
