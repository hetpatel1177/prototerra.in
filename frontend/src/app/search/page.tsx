'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShoppingBag, ArrowLeft, X } from 'lucide-react';
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
    tags?: string[];
    inStock: boolean;
    stockQty?: number;
    collectionId?: string;
}

interface Collection {
    _id: string;
    name: string;
    slug: string;
}

function SearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToCart, items } = useCart();

    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        const t = setTimeout(() => {
            const currentQ = searchParams.get('q') || '';
            if (inputValue.trim() !== currentQ) {
                if (inputValue.trim()) {
                    router.replace(`/search?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
                } else {
                    router.replace(`/search`, { scroll: false });
                }
            }
        }, 300);
        return () => clearTimeout(t);
    }, [inputValue, searchParams, router]);

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [allCollections, setAllCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState<string | null>(null);

    // Fetch all products + collections once
    useEffect(() => {
        Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`).then(r => r.json()),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`).then(r => r.json()),
        ]).then(([prod, col]) => {
            if (prod.success) setAllProducts(prod.data);
            if (col.success) setAllCollections(col.data);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // Filter based on current query
    const q = inputValue.toLowerCase().trim();
    const results = q
        ? allProducts.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            (p.material || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q))
        )
        : [];

    // Also match collections
    const collectionResults = q
        ? allCollections.filter(c => c.name.toLowerCase().includes(q))
        : [];

    function handleAdd(product: Product) {
        const cartItem = items.find(i => i.id === product._id);
        const qty = cartItem ? cartItem.quantity : 0;
        if (!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0) || qty >= (product.stockQty ?? Infinity)) return;
        addToCart(product, 1);
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1500);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (trimmed) router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }

    // Lookup collection name for a product
    function getCollectionName(collectionId?: string) {
        if (!collectionId) return null;
        return allCollections.find(c => c._id === collectionId)?.name || null;
    }

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-[1400px] mx-auto">

                {/* Header */}
                <div className="mb-12">
                    <Link href="/collections" className="inline-flex items-center gap-2 text-xs text-pt-secondary hover:text-pt-clay uppercase tracking-wider mb-8 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> Back to Collections
                    </Link>

                    {/* Search form */}
                    <form onSubmit={handleSearch} className="relative max-w-2xl mt-6">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-pt-secondary pointer-events-none" />
                        <input
                            autoFocus
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder="Search products, materials, collections..."
                            className="w-full bg-zinc-900/60 border border-zinc-700 focus:border-pt-clay rounded-sm pl-14 pr-14 py-4 text-lg text-pt-text placeholder:text-zinc-600 focus:outline-none transition-colors"
                        />
                        {inputValue && (
                            <button
                                type="button"
                                onClick={() => { setInputValue(''); router.push('/search'); }}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-pt-text transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>

                    {/* Result summary line */}
                    {!loading && q && (
                        <p className="mt-4 text-sm text-pt-secondary">
                            {results.length + collectionResults.length === 0
                                ? `No results for "${q}"`
                                : `Found ${results.length} product${results.length !== 1 ? 's' : ''} and ${collectionResults.length} collection${collectionResults.length !== 1 ? 's' : ''} for "${q}"`}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i}>
                                <div className="aspect-[3/4] bg-zinc-800 animate-pulse rounded-sm mb-4" />
                                <div className="h-4 bg-zinc-800 animate-pulse rounded mb-2 w-3/4" />
                                <div className="h-3 bg-zinc-800 animate-pulse rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : !q ? (
                    /* Empty state — no query yet */
                    <div className="py-24 text-center">
                        <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-lg mb-2">Start typing to search</p>
                        <p className="text-zinc-700 text-sm">Search across all products, materials and collections</p>
                    </div>
                ) : results.length === 0 && collectionResults.length === 0 ? (
                    /* No results */
                    <div className="py-24 text-center">
                        <ShoppingBag className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-lg mb-2">No results for &ldquo;{q}&rdquo;</p>
                        <p className="text-zinc-700 text-sm mb-8">Try a different search term or browse all collections</p>
                        <Link href="/collections" className="bg-pt-clay text-pt-bg px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors">
                            Browse All Collections
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Collection matches */}
                        {collectionResults.length > 0 && (
                            <div>
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-6 pb-3 border-b border-zinc-900">
                                    Collections · {collectionResults.length}
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    {collectionResults.map(col => (
                                        <Link
                                            key={col._id}
                                            href={`/collections/${col.slug}`}
                                            className="border border-zinc-700 hover:border-pt-clay px-5 py-2.5 text-sm font-medium hover:text-pt-clay transition-colors"
                                        >
                                            {col.name} →
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Product matches */}
                        {results.length > 0 && (
                            <div>
                                <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-6 pb-3 border-b border-zinc-900">
                                    Products · {results.length}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                                    {results.map(product => {
                                        const colName = getCollectionName(product.collectionId);
                                        return (
                                            <Link key={product._id} href={`/shop/${product._id}`} className="group block">
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

                                                    {/* Add to cart overlay */}
                                                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); handleAdd(product); }}
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
                                                                    : addedId === product._id
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-pt-clay text-pt-bg hover:bg-white hover:text-pt-bg'
                                                                }`}
                                                        >
                                                            {(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)) ? 'Out of Stock' : (() => {
                                                                const cartItem = items.find(i => i.id === product._id);
                                                                return cartItem && cartItem.quantity >= (product.stockQty ?? Infinity) ? 'Max Stock' : addedId === product._id ? '✓ Added!' : 'Add to Cart';
                                                            })()}
                                                        </button>
                                                    </div>

                                                    {(!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0)) && (
                                                        <div className="absolute top-3 left-3 bg-zinc-900/80 text-zinc-400 text-[10px] px-2 py-1 uppercase tracking-wider">
                                                            Sold Out
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-base mb-0.5 group-hover:text-pt-clay transition-colors truncate">{product.name}</h3>
                                                        <p className="text-xs text-pt-secondary truncate">
                                                            {colName ? (
                                                                <span className="hover:text-pt-clay transition-colors">
                                                                    {colName}
                                                                </span>
                                                            ) : (product.material || product.category)}
                                                            {product.dimensions && ` · ${product.dimensions}`}
                                                        </p>
                                                    </div>
                                                    <span className="text-pt-clay font-bold font-mono shrink-0">{formatPrice(product.price)}</span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
                <div className="text-pt-secondary text-sm tracking-widest animate-pulse">SEARCHING...</div>
            </main>
        }>
            <SearchResults />
        </Suspense>
    );
}
