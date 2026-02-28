'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

export default function CartPage() {
    const { items: cartItems, updateQuantity, removeFromCart, cartTotal, syncStock } = useCart();
    const [isSyncing, setIsSyncing] = useState(true);

    useEffect(() => {
        syncStock().finally(() => setIsSyncing(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isSyncing) {
        return (
            <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-pt-clay border-t-transparent rounded-full animate-spin mx-auto" />
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold mb-6">Your Cart is Empty</h1>
                <Link href="/collections" className="bg-pt-clay text-pt-bg px-8 py-3 font-bold uppercase tracking-wider hover:bg-white transition-colors">
                    Start Shopping
                </Link>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 px-6 md:px-12">
            <h1 className="text-4xl font-bold mb-12">Shopping Cart</h1>

            <div className="flex flex-col md:flex-row gap-12">
                {/* Cart Items */}
                <div className="w-full md:w-2/3">
                    <div className="border-b border-zinc-800 pb-4 mb-4 text-xs tracking-widest text-zinc-500 uppercase flex justify-between">
                        <span>Product</span>
                        <span className="hidden md:block">Total</span>
                    </div>

                    <div className="space-y-8">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex gap-6 items-start border-b border-zinc-900 pb-8">
                                <div className="w-24 h-32 bg-zinc-900 rounded-sm overflow-hidden relative group shrink-0">
                                    <Link href={`/shop/${item.id}`} className="absolute inset-0 z-10" />
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <Link href={`/shop/${item.id}`} className="hover:text-pt-clay transition-colors">
                                            <h3 className="font-bold text-lg">{item.name}</h3>
                                        </Link>
                                        <span className="md:hidden font-mono">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                    <p className="text-sm text-pt-secondary mb-4">{item.variant || 'Standard'}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-zinc-800 rounded-sm">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm px-2 w-8 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                disabled={item.quantity >= (item.stockQty ?? Infinity)}
                                                className={`p-2 transition-colors ${item.quantity >= (item.stockQty ?? Infinity) ? 'text-zinc-700 cursor-not-allowed' : 'hover:bg-zinc-900 text-zinc-500 hover:text-white'}`}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-xs text-zinc-500 hover:text-red-500 underline transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden md:block font-mono text-lg">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="w-full md:w-1/3">
                    <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-sm sticky top-32">
                        <h2 className="text-lg font-bold mb-6">Order Summary</h2>
                        <div className="flex justify-between mb-4 text-pt-secondary">
                            <span>Subtotal</span>
                            <span className="text-pt-text">{formatPrice(cartTotal)}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mb-8">Shipping and taxes calculated at checkout.</p>

                        <Link href="/checkout" className="block w-full bg-pt-clay text-pt-bg py-4 text-center font-bold uppercase tracking-widest hover:bg-white transition-colors mb-4">
                            Checkout
                        </Link>
                        <Link href="/collections" className="block w-full text-center text-xs uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
