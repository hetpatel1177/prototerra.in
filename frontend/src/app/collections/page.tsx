'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
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

interface Collection {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    featured: boolean;
    products?: Product[];
}

function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    function handleAdd(e: React.MouseEvent) {
        e.preventDefault();
        if (!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)) return;
        addToCart(product, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    return (
        <Link href={`/shop/${product._id}`} className="group block">
            <div className="aspect-[3/4] bg-zinc-900 rounded-sm mb-4 overflow-hidden relative">
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-zinc-600" />
                    </div>
                )}

                {/* Add to Cart overlay */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                        onClick={handleAdd}
                        disabled={!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)}
                        className={`w-full py-3 text-xs font-bold uppercase tracking-wider transition-colors
                            ${(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0))
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : added
                                    ? 'bg-green-600 text-white'
                                    : 'bg-pt-clay text-pt-bg hover:bg-white hover:text-pt-bg'
                            }`}
                    >
                        {(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)) ? 'Out of Stock' : added ? '✓ Added to Cart' : 'Add to Cart'}
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

function ProductSkeleton() {
    return (
        <div>
            <div className="aspect-[3/4] bg-zinc-800 rounded-sm mb-4 animate-pulse" />
            <div className="h-4 bg-zinc-800 rounded animate-pulse mb-2 w-3/4" />
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2" />
        </div>
    );
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAll() {
            try {
                // Fetch collections and products in parallel for faster loading
                const [colRes, prodRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
                ]);

                const colData = await colRes.json();
                const prodData = await prodRes.json();

                if (!colData.success) return;

                const cols: Collection[] = colData.data;
                const allProducts: Product[] = prodData.success ? prodData.data : [];

                // 3. Group products into their collections
                const withProducts = cols.map(col => ({
                    ...col,
                    products: allProducts.filter(p => p.collectionId === col._id || (p as any).collectionId?.toString() === col._id)
                }));

                setCollections(withProducts);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    function handleScrollTo(slug: string) {
        document.getElementById(`collection-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text">
            {/* Hero Header */}
            <header className="pt-40 pb-24 px-6 md:px-12 border-b border-zinc-900">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-4 block">Shop</span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter">
                            The <span className="text-pt-clay italic font-serif">Collections</span>
                        </h1>
                    </div>
                    <p className="text-pt-secondary text-lg max-w-md leading-relaxed border-l-2 border-zinc-800 pl-6">
                        A curated assembly of artisanal pottery, where ancient tradition meets modern form.
                        Each piece is born from the earth and shaped by hands.
                    </p>
                </div>
            </header>

            {/* Collection Index (Quick jump nav) */}
            {!loading && collections.length > 0 && (
                <nav className="sticky top-[65px] z-40 bg-black/50 backdrop-blur-md border-b border-white/5 transition-all duration-300 px-6 md:px-12 py-4">
                    <div className="max-w-[1400px] mx-auto flex gap-6 overflow-x-auto scrollbar-hide">
                        {collections.map(col => (
                            <button
                                key={col._id}
                                onClick={() => handleScrollTo(col.slug)}
                                className="shrink-0 text-xs font-bold uppercase tracking-widest text-pt-secondary hover:text-pt-clay transition-colors whitespace-nowrap"
                            >
                                {col.name}
                                {col.products && col.products.length > 0 && (
                                    <span className="ml-1.5 text-zinc-600">({col.products.length})</span>
                                )}
                            </button>
                        ))}
                    </div>
                </nav>
            )}

            {/* Collections with products */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-32">
                {loading ? (
                    // Skeletons
                    [1, 2, 3].map(i => (
                        <div key={i}>
                            <div className="h-8 bg-zinc-800 rounded animate-pulse w-48 mb-4" />
                            <div className="h-4 bg-zinc-800 rounded animate-pulse w-96 mb-12" />
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(j => <ProductSkeleton key={j} />)}
                            </div>
                        </div>
                    ))
                ) : (
                    collections.map((col, idx) => (
                        <section
                            key={col._id}
                            id={`collection-${col.slug}`}
                            className="scroll-mt-32"
                        >
                            {/* Collection Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-zinc-900">
                                <div>
                                    <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-2 block">
                                        Collection {String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-3">{col.name}</h2>
                                    <p className="text-pt-secondary max-w-lg mb-6">{col.description}</p>
                                    <Link href={`/collections/${col.slug}`} className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-pt-text hover:text-pt-clay transition-colors group">
                                        See All Products <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                {col.image && (
                                    <div className="hidden md:block w-40 h-24 rounded-sm overflow-hidden shrink-0">
                                        <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Products Grid */}
                            {col.products && col.products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                        {col.products.slice(0, 4).map(product => (
                                            <ProductCard key={product._id} product={product} />
                                        ))}
                                    </div>
                                    {col.products.length > 4 && (
                                        <div className="mt-12 md:mt-16 flex justify-center">
                                            <Link href={`/collections/${col.slug}`} className="border border-zinc-800 text-pt-secondary hover:border-pt-clay hover:text-pt-clay px-8 py-3 text-xs font-bold uppercase tracking-widest transition-all hover:bg-zinc-900 duration-300 flex items-center gap-2 group">
                                                Discover Full Collection ({col.products.length} pieces) <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-16 text-center border border-dashed border-zinc-800 rounded-sm">
                                    <ShoppingBag className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                                    <p className="text-zinc-600 text-sm">No products in this collection yet.</p>
                                </div>
                            )}
                        </section>
                    ))
                )}
            </div>
        </main>
    );
}
