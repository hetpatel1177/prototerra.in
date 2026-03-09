'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
    slug?: string;
    price: number;
    images: string[];
    description: string;
    dimensions?: string;
    material?: string;
    category?: string;
    inStock: boolean;
    stockQty?: number;
    collectionId?: string;
}

export default function ProductCard({ product }: { product: Product }) {
    const { addToCart, items } = useCart();
    const [added, setAdded] = useState(false);

    function handleAdd(e: React.MouseEvent) {
        e.preventDefault();
        const cartItem = items.find(i => i.id === product._id);
        const qty = cartItem ? cartItem.quantity : 0;
        if (!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0) || qty >= (product.stockQty ?? Infinity)) return;
        addToCart(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    return (
        <Link href={`/shop/${product.slug || product._id}`} className="group block">
            <div className="aspect-[3/4] bg-zinc-900 rounded-sm mb-4 overflow-hidden relative">
                {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-zinc-600" />
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={handleAdd}
                        disabled={!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0) || (() => {
                            const cartItem = items.find(i => i.id === product._id);
                            return cartItem ? cartItem.quantity >= (product.stockQty ?? Infinity) : false;
                        })()}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-wider transition-colors
                            ${(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0) || (() => {
                                const cartItem = items.find(i => i.id === product._id);
                                return cartItem ? cartItem.quantity >= (product.stockQty ?? Infinity) : false;
                            })())
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : added
                                    ? 'bg-green-600 text-white'
                                    : 'bg-pt-clay text-pt-bg hover:bg-white hover:text-pt-bg'
                            }`}
                    >
                        {(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)) ? 'Out of Stock' : (() => {
                            const cartItem = items.find(i => i.id === product._id);
                            return cartItem && cartItem.quantity >= (product.stockQty ?? Infinity) ? 'Max Stock' : added ? '✓ Added to Cart' : 'Add to Cart';
                        })()}
                    </button>
                </div>

                {/* Out of stock badge */}
                {(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)) && (
                    <div className="absolute top-3 left-3 bg-zinc-900/80 text-zinc-400 text-[10px] px-2 py-1 uppercase tracking-wider">
                        Sold Out
                    </div>
                )}
            </div>

            <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base mb-1 group-hover:text-pt-clay transition-colors truncate">{product.name}</h3>
                    <p className="text-xs text-pt-secondary truncate">
                        {product.material || product.category} {product.dimensions && `· ${product.dimensions}`}
                    </p>
                </div>
                <span className="text-pt-clay font-bold font-mono shrink-0">{formatPrice(product.price)}</span>
            </div>
        </Link>
    );
}
