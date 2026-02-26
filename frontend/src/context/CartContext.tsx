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
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: any, quantity?: number, variant?: string) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('prototerra-cart');
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('prototerra-cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: any, quantity = 1, variant = 'Standard') => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product._id);
            if (existing) {
                return prev.map(item =>
                    item.id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                id: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                quantity,
                variant
            }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return removeFromCart(id);
        setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const clearCart = () => setItems([]);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
}
