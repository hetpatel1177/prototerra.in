'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    material?: string;
    category?: string;
    dimensions?: string;
}

function TiltCard({ product, index }: { product: Product; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 50, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(((e.clientX - rect.left) / rect.width - 0.5) * 20);
        y.set(((e.clientY - rect.top) / rect.height - 0.5) * -20);
    }

    const rotateX = useTransform(mouseY, v => v);
    const rotateY = useTransform(mouseX, v => v);

    return (
        <Link href={`/shop/${product._id}`}>
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => { x.set(0); y.set(0); }}
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                className="relative w-full aspect-[4/5] bg-zinc-900 border border-zinc-800 group overflow-hidden cursor-pointer"
            >
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-zinc-600" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 translate-z-[20px]">
                    <h3 className="text-lg text-pt-text font-medium tracking-wide">{product.name}</h3>
                    <p className="text-xs text-pt-clay mt-1 uppercase tracking-widest">
                        {product.material || product.category || 'Ceramic'} {product.dimensions && `· ${product.dimensions}`} · {formatPrice(product.price)}
                    </p>
                </div>
                <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
            </motion.div>
        </Link>
    );
}

function TiltCardSkeleton() {
    return <div className="w-full aspect-[4/5] bg-zinc-800 animate-pulse rounded-sm" />;
}

export default function Gallery() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setProducts(d.data.slice(0, 4));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const items = loading
        ? [1, 2, 3, 4]
        : products;

    return (
        <section className="min-h-screen bg-pt-bg py-32 px-6">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-sm text-pt-secondary uppercase tracking-widest mb-16 text-center">Collection</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {loading
                        ? [1, 2, 3, 4].map(i => (
                            <div key={i} className={i % 2 === 0 ? 'md:mt-24' : 'mt-0'}>
                                <TiltCardSkeleton />
                            </div>
                        ))
                        : products.map((p, i) => (
                            <div key={p._id} className={i % 2 === 1 ? 'md:mt-24' : 'mt-0'}>
                                <TiltCard product={p} index={i} />
                            </div>
                        ))
                    }
                </div>
            </div>
        </section>
    );
}
