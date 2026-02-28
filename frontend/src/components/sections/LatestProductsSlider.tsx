
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    category: string;
    dimensions?: string;
    description: string;
    inStock: boolean;
    stockQty: number;
}

export default function LatestProductsSlider() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [itemsPerView, setItemsPerView] = useState(1);
    const [isResetting, setIsResetting] = useState(false);

    // Fetch latest products
    useEffect(() => {
        async function fetchProducts() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.prototerra.in';
                const res = await fetch(`${apiUrl}/api/products`);
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data.slice(0, 8));
                }
            } catch (err) {
                console.error('Failed to load latest products', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    // Handle responsive items per view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setItemsPerView(3);
            } else {
                setItemsPerView(1);
            }
        };

        // Initial call
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Create the display list with buffer at the end for seamless looping
    // We append the first 'itemsPerView' items to the end
    const extendedProducts = products.length > 0
        ? [...products, ...products.slice(0, itemsPerView)]
        : [];

    // Auto-slide
    useEffect(() => {
        if (products.length === 0) return;
        const interval = setInterval(() => {
            handleNext();
        }, 4000); // 4 seconds
        return () => clearInterval(interval);
    }, [currentIndex, products.length, isResetting]);

    const handleNext = () => {
        if (isResetting) return;

        if (currentIndex === products.length) {
            // We are at the end (buffer start), snap to 0 first then slide?
            // No, we are visually at 0. Slide to 1.
            // Wait, logic:
            // 0 -> 1 -> ... -> len-1 -> len (which is visual 0)
            // If we are at len, we need to snap to 0 instantly, then slide to 1.
            setIsResetting(true);
            setCurrentIndex(0);

            // Allow a tiny tick for state update to snap without animation
            setTimeout(() => {
                setIsResetting(false);
                setCurrentIndex(1);
            }, 50);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (isResetting) return;
        if (currentIndex === 0) {
            // Wrap around to end
            setIsResetting(true);
            setCurrentIndex(products.length);
            setTimeout(() => {
                setIsResetting(false);
                setCurrentIndex(products.length - 1);
            }, 50);
        } else {
            setCurrentIndex(prev => prev - 1);
        }
    };

    // Handle transition end to detect loop completion
    const onTransitionEnd = () => {
        if (currentIndex === products.length) {
            // We moved to the buffer (visual 0). Snap reset.
            setIsResetting(true);
            setCurrentIndex(0);
            setTimeout(() => setIsResetting(false), 50);
        }
    };

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section className="py-24 px-6 md:px-12 bg-zinc-950 border-t border-zinc-900 border-b border-zinc-900 overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-4 block">New Arrivals</span>
                        <h2 className="text-3xl md:text-5xl font-bold">Just Launched</h2>
                    </div>

                    {/* Manual Controls */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-pt-clay hover:text-black hover:border-pt-clay transition-all group"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-pt-clay hover:text-black hover:border-pt-clay transition-all group"
                        >
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden -mx-3 px-3">
                    <div
                        className="flex"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                            transition: isResetting ? 'none' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                        onTransitionEnd={onTransitionEnd}
                    >
                        {extendedProducts.map((product, index) => (
                            <div
                                key={`${product._id}-${index}`}
                                className="w-full md:w-1/3 px-3 flex-shrink-0"
                            >
                                <Link href={`/shop/${product._id}`} className="group block h-full">
                                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-sm overflow-hidden h-full flex flex-col hover:border-zinc-700 transition-colors duration-500 relative">
                                        <div className="aspect-[4/5] w-full overflow-hidden relative bg-zinc-900">
                                            {product.images?.[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                                                    <div className="text-zinc-600">No Image</div>
                                                </div>
                                            )}

                                            {/* Corner badge */}
                                            {(!product.inStock || product.stockQty <= 0) ? (
                                                <div className="absolute top-4 left-4 bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10">
                                                    Sold Out
                                                </div>
                                            ) : (
                                                <div className="absolute top-4 left-4 bg-pt-clay text-pt-bg text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10">
                                                    New
                                                </div>
                                            )}

                                            {/* Hover Action */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                                <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                                    <ArrowUpRight className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2 h-6">
                                                <p className="text-xs text-pt-clay font-bold uppercase tracking-wider truncate mr-2">
                                                    {product.category} {product.dimensions && `· ${product.dimensions}`}
                                                </p>
                                                <span className="font-mono font-bold text-sm text-white whitespace-nowrap">{formatPrice(product.price)}</span>
                                            </div>
                                            <h3 className="text-xl font-medium mb-3 group-hover:text-pt-clay transition-colors line-clamp-1 h-7">{product.name}</h3>
                                            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed h-10">{product.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
