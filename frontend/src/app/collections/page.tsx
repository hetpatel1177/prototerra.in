import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CollectionsNav from './CollectionsNav';

export const revalidate = 3600;

async function getData() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [colRes, prodRes] = await Promise.all([
        fetch(`${apiUrl}/api/collections`, { next: { revalidate: 3600 } }),
        fetch(`${apiUrl}/api/products`, { next: { revalidate: 3600 } })
    ]);

    const colData = await colRes.json();
    const prodData = await prodRes.json();

    if (!colData.success) return [];

    const cols = colData.data;
    const allProducts = prodData.success ? prodData.data : [];

    return cols.map((col: any) => ({
        ...col,
        products: allProducts.filter((p: any) => p.collectionId === col._id || p.collectionId?.toString() === col._id)
    }));
}

export const metadata: Metadata = {
    title: 'The Collections',
    description: 'A curated assembly of artisanal pottery, where ancient tradition meets modern form. Browse our featured collections of premium ceramics.',
    alternates: {
        canonical: '/collections',
    }
};

export default async function CollectionsPage() {
    const collections = await getData();

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
            {collections.length > 0 && (
                <CollectionsNav collections={collections} />
            )}

            {/* Collections with products */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 space-y-32">
                {collections.length > 0 ? (
                    collections.map((col: any, idx: number) => (
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
                                    <div className="hidden md:block w-40 h-24 rounded-sm overflow-hidden shrink-0 relative">
                                        <Image src={col.image} alt={col.name} fill sizes="160px" className="object-cover" />
                                    </div>
                                )}
                            </div>

                            {/* Products Grid */}
                            {col.products && col.products.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                                        {col.products.slice(0, 4).map((product: any) => (
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
                ) : (
                    <div className="py-24 text-center border border-dashed border-zinc-800 rounded-sm">
                        <ShoppingBag className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 text-sm mb-6">No collections found yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
