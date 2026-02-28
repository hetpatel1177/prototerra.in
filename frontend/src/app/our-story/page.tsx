"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Default content as fallback
const defaultContent = {
    hero: {
        title: "Born from Dust,\nDefined by Fire",
        subtitle: "Est. 2021",
        description: "We bridge the gap between ancient ritual and modern living, crafting vessels that carry the weight of history and the lightness of art.",
        image: "/assets/our_story_hero_page.png"
    },
    philosophy: {
        heading: "Earth, Hand,\n and Spirit",
        text1: "At ProtoTerra, we believe in the profound connection between the earth and the hand. Our work is a tribute to handcrafted tradition, where every curve and fault line is a testament to the soul of the maker and the raw beauty of natural minerals.",
        text2: "In an age of mass production, we slow down. We listen to the material. We honor the imperfections that make each piece uniquely human.",
        image: "/assets/our_story_hero_page.png"
    },
    process: {
        heading: "The Process",
        description: "From raw soil to finished masterpiece, requiring patience, heat, and grace.",
        steps: [
            { title: 'The Sourcing', desc: 'Refined soils from the Atlas Mountains source high-mineral clay known for its durability and unique iron-rich finish.', img: '/assets/the_sourcing.jpeg' },
            { title: 'The Shaping', desc: 'Hours are spent at the wheel, where centrifugal force and steady palms dictate the form. No two shapes are ever identical.', img: '/assets/shaping.png' },
            { title: 'The Firing', desc: 'In our custom-built wood kilns, temperature reaches 1280°C. The fire breathes life into the clay, permanently bonding it to the earth.', img: '/assets/firing.png' }
        ]
    }
};

export default function OurStoryPage() {
    const [content, setContent] = useState(defaultContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/our-story`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    // Merge with default to ensure structure in case of partial data
                    setContent(prev => ({ ...prev, ...data.data }));
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Helper to handle new lines in titles
    // Helper to handle new lines in titles with emphasis on the last line
    const renderTitle = (title: string) => {
        const lines = title.split('\n');
        return lines.map((line, i) => (
            <span
                key={i}
                className={`block ${i === lines.length - 1 && lines.length > 1 ? 'text-pt-clay italic font-serif mt-2' : ''}`}
            >
                {line}
            </span>
        ));
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-pt-bg flex items-center justify-center">
                <div className="text-pt-clay uppercase tracking-widest text-xs animate-pulse">Loading Story...</div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-transparent text-pt-text">
            {/* Fixed Hero Background */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute inset-0 bg-zinc-900 opacity-50 z-10"></div>
                <Image
                    src={content.hero.image || defaultContent.hero.image}
                    alt="Hero"
                    fill
                    priority
                    className="object-cover opacity-60 z-0"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-pt-bg/30 via-transparent to-pt-bg z-10" />
            </div>

            {/* Section 1: Hero / Intro */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                <div className="relative z-10 text-center max-w-4xl px-6">
                    <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-4 block animate-fade-in-up">
                        {content.hero.subtitle}
                    </span>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 leading-tight animate-fade-in-up animation-delay-200">
                        {renderTitle(content.hero.title)}
                    </h1>
                    <p className="text-xl text-pt-secondary max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
                        {content.hero.description}
                    </p>
                </div>
            </section>

            {/* Content wrapper with solid background */}
            <div className="relative z-10 bg-pt-bg">
                {/* Section 2: Earth, Hand, Spirit */}
                <section className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div className="order-2 md:order-1 relative aspect-square bg-zinc-900 rounded-sm overflow-hidden group">
                        <Image
                            src={content.philosophy.image || defaultContent.philosophy.image}
                            alt="Philosophy"
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                    </div>
                    <div className="order-1 md:order-2">
                        <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-4 block">Philosophy</span>
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                            {renderTitle(content.philosophy.heading)}
                        </h2>
                        <p className="text-pt-secondary text-lg leading-relaxed mb-8">
                            {content.philosophy.text1}
                        </p>
                        <p className="text-pt-secondary text-lg leading-relaxed mb-8">
                            {content.philosophy.text2}
                        </p>
                        <div className="w-12 h-1 bg-pt-clay"></div>
                    </div>
                </section>

                {/* Section 3: The Process */}
                <section className="py-32 bg-zinc-950 px-6 md:px-12">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">{content.process.heading}</h2>
                            <p className="text-pt-secondary max-w-xl mx-auto">
                                {content.process.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {content.process.steps.map((step: any, i: number) => (
                                <div key={i} className="group cursor-default">
                                    <div className="aspect-video bg-zinc-900 mb-8 overflow-hidden rounded-sm relative">
                                        <span className="absolute top-4 left-4 bg-pt-clay text-pt-bg rounded-full w-8 h-8 flex items-center justify-center font-bold z-10 transition-transform duration-500 group-hover:scale-110">0{i + 1}</span>
                                        <Image
                                            src={step.img || step.image || defaultContent.process.steps[i]?.img || '/assets/story-hero.jpg'}
                                            alt={step.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-out"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 group-hover:text-pt-clay transition-colors duration-300">{step.title}</h3>
                                    <p className="text-pt-secondary leading-relaxed text-sm">{step.desc || step.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* CTA */}
                <section className="py-32 px-6">
                    <div className="max-w-6xl mx-auto bg-pt-clay rounded-2xl p-12 md:p-24 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold text-pt-bg mb-6">Carry the Legacy Home</h2>
                            <p className="text-pt-bg/80 text-lg max-w-2xl mx-auto mb-10">
                                Own a piece of the earth, redefined by artisanal fire. Explore our curated webstore of artifacts.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link href="/collections" className="bg-pt-bg text-pt-text px-8 py-3 font-bold uppercase tracking-wider hover:bg-black transition-colors block w-fit mx-auto">
                                    Browse Collection
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
