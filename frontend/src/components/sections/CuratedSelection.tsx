'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    stockQty?: number;
}

export default function CuratedSelection() {
    const [products, setProducts] = useState<Product[]>([]);
    const { addToCart, items } = useCart();
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
                                        ? <Image src={item.images[0]} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                        : <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <ShoppingBag className="w-8 h-8 text-zinc-600" />
                                        </div>
                                    }
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const cartItem = items.find((i) => i.id === item._id);
                                                const cartQty = cartItem ? cartItem.quantity : 0;
                                                const reachedLimit = cartQty >= (item.stockQty ?? Infinity);
                                                if (item.inStock && item.stockQty !== 0 && !reachedLimit) addToCart(item, 1);
                                            }}
                                            disabled={!item.inStock || item.stockQty === 0 || (() => {
                                                const ci = items.find(i => i.id === item._id);
                                                return ci ? ci.quantity >= (item.stockQty ?? Infinity) : false;
                                            })()}
                                            className={`w-full py-2 text-xs font-bold uppercase tracking-wider transition-colors 
                                                ${(!item.inStock || item.stockQty === 0 || (() => {
                                                    const ci = items.find(i => i.id === item._id);
                                                    return ci ? ci.quantity >= (item.stockQty ?? Infinity) : false;
                                                })())
                                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                    : 'bg-pt-clay text-pt-bg hover:bg-white'}`}
                                        >
                                            {(!item.inStock || item.stockQty === 0) ? 'Out of Stock' : (() => {
                                                const ci = items.find(i => i.id === item._id);
                                                return ci && ci.quantity >= (item.stockQty ?? Infinity) ? 'Max Stock' : 'Quick Add';
                                            })()}
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
