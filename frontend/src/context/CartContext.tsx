'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// Define the shape of a cart item
// Using 'any' for product details flexibility for now, but ideally interface Product
export interface CartItem {
    id: string; // product._id
    name: string;
    price: number;
    image: string;
    quantity: number;
    variant?: string;
    stockQty?: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, quantity?: number, variant?: string) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    syncStock: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount and sync across tabs
    useEffect(() => {
        const loadCart = () => {
            const stored = localStorage.getItem('prototerra-cart');
            if (stored) {
                try {
                    setItems(JSON.parse(stored));
                } catch (e) {
                    console.error('Failed to parse cart', e);
                }
            } else {
                setItems([]);
            }
        };

        loadCart();
        setIsLoaded(true);

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'prototerra-cart') {
                loadCart();
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('prototerra-cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (product: any, quantity = 1, variant = 'Standard') => {
        const stockLimit = product.stockQty ?? Infinity;
        setItems(prev => {
            const existing = prev.find(item => item.id === product._id);
            if (existing) {
                return prev.map(item =>
                    item.id === product._id
                        ? { ...item, quantity: Math.min(item.quantity + quantity, stockLimit) }
                        : item
                );
            }
            return [...prev, {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity: Math.min(quantity, stockLimit),
                variant,
                stockQty: stockLimit
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return removeFromCart(id);
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const limit = item.stockQty ?? Infinity;
                return { ...item, quantity: Math.min(quantity, limit) };
            }
            return item;
        }));
    };

    const clearCart = () => setItems([]);

    const syncStock = async () => {
        if (items.length === 0) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
            const data = await res.json();
            if (data.success) {
                const products = data.data;
                setItems(prev => {
                    return prev.map(item => {
                        const product = products.find((p: any) => p._id === item.id);
                        if (product) {
                            const newStockLimit = product.stockQty ?? Infinity;
                            return {
                                ...item,
                                stockQty: newStockLimit,
                                // Automatically cap the quantity if the current stock is lower
                                quantity: Math.min(item.quantity, newStockLimit)
                            };
                        }
                        return item;
                    }).filter(item => item.quantity > 0); // Remove items that fell to 0 stock
                });
            }
        } catch (error) {
            console.error('Failed to sync stock', error);
        }
    };

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, syncStock }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
