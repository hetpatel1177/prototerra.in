'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Truck, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';

export default function ProductPage() {
    const { slug } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [added, setAdded] = useState(false);
    const [activeImg, setActiveImg] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        if (!slug) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProduct(data.data);
                    setActiveImg(0);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [slug]);

    const handleAddToCart = () => {
        if (!product || product.stockQty <= 0) return;
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!zoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x, y });
    }

    const images: string[] = product?.images || [];
    const hasMultiple = images.length > 1;

    function prev() { setActiveImg(i => (i - 1 + images.length) % images.length); }
    function next() { setActiveImg(i => (i + 1) % images.length); }

    if (loading) return (
        <div className="min-h-screen pt-32 flex items-center justify-center">
            <div className="space-y-3 text-center">
                <div className="w-8 h-8 border-2 border-pt-clay border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-pt-secondary text-sm tracking-widest uppercase">Loading artifact...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen pt-32 flex items-center justify-center text-pt-secondary">
            Artifact not found.
        </div>
    );

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text pt-28 pb-24">
            <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 md:px-12">

                {/* ── Left: Image Gallery ── */}
                <div className="space-y-4">
                    {/* Main image */}
                    <div
                        className={`relative aspect-square bg-zinc-900 rounded-sm overflow-hidden select-none ${images.length > 0 ? 'cursor-zoom-in' : ''} ${zoomed ? '!cursor-zoom-out' : ''}`}
                        onClick={() => images.length > 0 && setZoomed(v => !v)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setZoomed(false)}
                    >
                        {images.length > 0 ? (
                            <div
                                className="w-full h-full transition-transform duration-300"
                                style={
                                    zoomed
                                        ? { transform: 'scale(2)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                                        : { transform: 'scale(1)', transformOrigin: 'center' }
                                }
                            >
                                <img
                                    key={activeImg}
                                    src={images[activeImg]}
                                    alt={`${product.name} — view ${activeImg + 1}`}
                                    className="object-cover w-full h-full"
                                    style={{ transition: 'opacity 0.25s ease' }}
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                No Image
                            </div>
                        )}

                        {/* Zoom hint */}
                        {images.length > 0 && !zoomed && (
                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-sm p-1.5 pointer-events-none">
                                <ZoomIn className="w-3.5 h-3.5 text-white/70" />
                            </div>
                        )}

                        {/* Prev / Next arrows (only if multiple images) */}
                        {hasMultiple && !zoomed && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prev(); }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 backdrop-blur-sm rounded-sm p-2 transition-all hover:scale-110"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); next(); }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 backdrop-blur-sm rounded-sm p-2 transition-all hover:scale-110"
                                >
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </button>

                                {/* Dot indicators */}
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setActiveImg(i); }}
                                            className={`rounded-full transition-all duration-300 ${i === activeImg
                                                ? 'bg-pt-clay w-5 h-1.5'
                                                : 'bg-white/40 w-1.5 h-1.5 hover:bg-white/70'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnail strip */}
                    {hasMultiple && (
                        <div className="flex gap-3 overflow-x-auto pb-1 mt-4 scrollbar-thin">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-all duration-200 ${i === activeImg
                                        ? 'border-pt-clay scale-[1.05]'
                                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-zinc-600'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`${product.name} thumbnail ${i + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Image counter */}
                    {hasMultiple && (
                        <p className="text-xs text-pt-secondary text-right pr-1">
                            {activeImg + 1} / {images.length}
                        </p>
                    )}
                </div>

                {/* ── Right: Product Details ── */}
                <div className="pt-4 md:pt-8 flex flex-col justify-center">


                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
                    <p className="text-xl md:text-2xl text-pt-clay font-mono mb-6 md:mb-8">{formatPrice(product.price)}</p>

                    <p className="text-pt-secondary leading-relaxed mb-6 md:mb-8 max-w-md">
                        {product.description}
                    </p>

                    {product.features && product.features.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Features</h3>
                            <ul className="grid grid-cols-2 gap-y-2 text-sm text-pt-secondary">
                                {product.features.map((feat: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-pt-clay rounded-full flex-shrink-0" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {product.material && (
                        <div className="mb-8 text-sm text-pt-secondary">
                            <span className="font-bold uppercase tracking-wider text-pt-text">Material: </span>
                            {product.material}
                        </div>
                    )}

                    {product.dimensions && (
                        <div className="mb-8 text-sm text-pt-secondary">
                            <span className="font-bold uppercase tracking-wider text-pt-text">Dimensions: </span>
                            {product.dimensions}
                        </div>
                    )}

                    <div className="flex gap-4 mb-12 border-b border-zinc-800 pb-12">
                        <button
                            disabled={!product.inStock || product.stockQty <= 0}
                            onClick={handleAddToCart}
                            className={`flex-1 py-4 font-bold uppercase tracking-widest transition-all duration-300 
                                ${(!product.inStock || product.stockQty <= 0)
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : added
                                        ? 'bg-white text-pt-bg'
                                        : 'bg-pt-clay text-pt-bg hover:bg-white'}`}
                        >
                            {(!product.inStock || product.stockQty <= 0) ? 'Out of Stock' : added ? '✓ Added to Cart' : 'Add to Cart'}
                        </button>
                    </div>

                    <div className="flex gap-8 text-xs text-pt-secondary uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Free Shipping
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Lifetime Warranty
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
