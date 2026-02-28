'use client';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';

interface Product {
    _id: string;
    name: string;
    images: string[];
    material?: string;
    category?: string;
}

export default function MaterialReveal() {
    const containerRef = useRef<HTMLElement>(null);
    const [product, setProduct] = useState<Product | null>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'center center']
    });

    const blur = useTransform(scrollYProgress, [0, 1], [12, 0]);
    const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
            .then(r => r.json())
            .then(d => { if (d.success && d.data.length > 0) setProduct(d.data[0]); })
            .catch(console.error);
    }, []);

    const imageSrc = product?.images?.[0] || '/asset/sequence1.jpg';
    const label = product
        ? `${product.material || product.category || 'Raw Material'} · ${product.name}`
        : 'Raw Material 01';

    return (
        <section ref={containerRef} className="min-h-[80vh] flex items-center justify-center bg-pt-bg py-24 overflow-hidden">
            <div className="relative w-full max-w-5xl px-6 aspect-video">
                <motion.div
                    style={{
                        filter: useTransform(blur, (v) => `blur(${v}px)`),
                        opacity,
                        y
                    }}
                    className="w-full h-full bg-pt-secondary/10 overflow-hidden relative"
                >
                    <Image
                        src={imageSrc}
                        alt={label}
                        fill
                        sizes="(max-width: 1024px) 100vw, 1024px"
                        className="object-cover scale-110"
                    />
                    <div className="absolute bottom-8 left-8">
                        <span className="text-pt-text text-sm tracking-widest uppercase bg-pt-bg/50 backdrop-blur-md px-4 py-2">
                            {label}
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
