'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
    description: string;
    category: string;
    dimensions?: string;
    material?: string;
    inStock: boolean;
    stockQty?: number;
}

interface Collection {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
}

export default function CollectionPage() {
    const { slug } = useParams();
    const { addToCart, items } = useCart();
    const [products, setProducts] = useState<Product[]>([]);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);
    const [addedId, setAddedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                if (!slug) return;

                // Fetch collection details by slug
                const colRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections/${slug}`);
                const colData = await colRes.json();

                if (colData.success && colData.data) {
                    setCollection(colData.data);
                    const collectionId = colData.data._id;

                    // Fetch products filtered by collectionId
                    const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?collectionId=${collectionId}`);
                    const prodData = await prodRes.json();
                    if (prodData.success) setProducts(prodData.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [slug]);

    function handleAdd(product: Product) {
        const cartItem = items.find(i => i.id === product._id);
        const qty = cartItem ? cartItem.quantity : 0;
        if (!product.inStock || (product.stockQty !== undefined && product.stockQty <= 0) || qty >= (product.stockQty ?? Infinity)) return;
        addToCart(product, 1);
        setAddedId(product._id);
        setTimeout(() => setAddedId(null), 1500);
    }

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text">
            {/* Hero banner */}
            <div className="relative pt-32 pb-24 px-6 md:px-12 overflow-hidden border-b border-zinc-900">
                {collection?.image && (
                    <div className="absolute inset-0 z-0">
                        <Image src={collection.image} alt={collection.name} fill priority sizes="100vw" className="object-cover opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-pt-bg/80 to-pt-bg" />
                    </div>
                )}
                <div className="relative z-10 max-w-[1400px] mx-auto">
                    <Link href="/collections" className="inline-flex items-center gap-2 text-xs text-pt-secondary hover:text-pt-clay uppercase tracking-wider mb-8 transition-colors">
                        <ArrowLeft className="w-3 h-3" /> All Collections
                    </Link>
                    <span className="text-pt-clay text-xs tracking-[0.3em] uppercase mb-4 block">Collection</span>
                    <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6">
                        {collection?.name || (typeof slug === 'string' ? slug.replace(/-/g, ' ') : 'Collection')}
                    </h1>
                    {collection?.description && (
                        <p className="text-pt-secondary text-lg max-w-xl leading-relaxed">{collection.description}</p>
                    )}
                </div>
            </div>

            {/* Products */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i}>
                                <div className="aspect-[3/4] bg-zinc-800 animate-pulse rounded-sm mb-4" />
                                <div className="h-4 bg-zinc-800 animate-pulse rounded mb-2 w-3/4" />
                                <div className="h-3 bg-zinc-800 animate-pulse rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {products.map(product => (
                            <Link key={product._id} href={`/shop/${product._id}`} className="group block">
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

                                    {/* Add to Cart overlay */}
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
                                        <h3 className="font-bold text-base mb-1 group-hover:text-pt-clay transition-colors truncate">{product.name}</h3>
                                        <p className="text-xs text-pt-secondary truncate">
                                            {product.material || product.category} {product.dimensions && `· ${product.dimensions}`}
                                        </p>
                                    </div>
                                    <span className="text-pt-clay font-bold font-mono shrink-0">{formatPrice(product.price)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 text-center border border-dashed border-zinc-800 rounded-sm">
                        <ShoppingBag className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-sm mb-6">No artifacts found in this collection yet.</p>
                        <Link href="/collections" className="text-xs text-pt-clay hover:text-white uppercase tracking-widest transition-colors">
                            Browse All Collections →
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
