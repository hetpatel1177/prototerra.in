'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    material?: string;
    category?: string;
    inStock: boolean;
}

export default function CuratedSelection() {
    const [products, setProducts] = useState<Product[]>([]);
    const { addToCart } = useCart();
    const skeletons = [1, 2, 3, 4];

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
            .then(r => r.json())
            .then(d => { if (d.success) setProducts(d.data.slice(0, 4)); })
            .catch(console.error);
    }, []);

    return (
        <section className="py-24 px-6 md:px-12 bg-pt-bg text-pt-text">
            <div className="text-center mb-16">
                <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-3 block">Hand-Picked</span>
                <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">Curated Selection</h2>
                <p className="text-pt-secondary">Hand-picked artifacts for your sanctuary.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {products.length > 0
                    ? products.map((item) => (
                        <div key={item._id} className="group block">
                            <Link href={`/shop/${item._id}`} className="block">
                                <div className="aspect-[4/5] bg-zinc-900 rounded-sm mb-6 overflow-hidden relative">
                                    {item.images?.[0]
                                        ? <img src={item.images[0]} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                        : <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-zinc-600" />
                                        </div>
                                    }
                                    {/* Quick Add overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (item.inStock) addToCart(item, 1);
                                            }}
                                            className="w-full bg-pt-clay text-pt-bg py-2 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
                                        >
                                            {item.inStock ? 'Quick Add' : 'Out of Stock'}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 group-hover:text-pt-clay transition-colors">{item.name}</h3>
                                        <p className="text-xs text-pt-secondary">{item.material || item.category || item.description}</p>
                                    </div>
                                    <span className="text-pt-clay font-bold font-mono">{formatPrice(item.price)}</span>
                                </div>
                            </Link>
                        </div>
                    ))
                    : skeletons.map(i => (
                        <div key={i} className="block">
                            <div className="aspect-[4/5] bg-zinc-800 rounded-sm mb-6 animate-pulse" />
                            <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4" />
                            <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2" />
                        </div>
                    ))
                }
            </div>

            <div className="text-center mt-16">
                <Link href="/collections" className="inline-flex items-center gap-2 border border-zinc-700 text-pt-text py-3 px-8 text-xs font-bold uppercase tracking-wider hover:border-pt-clay hover:text-pt-clay transition-colors">
                    Shop All Collections <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </section>
    );
}
