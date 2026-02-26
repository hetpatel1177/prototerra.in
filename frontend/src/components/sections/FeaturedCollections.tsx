'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Collection {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
}

export default function FeaturedCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.prototerra.in';
        fetch(`${apiUrl}/api/collections`)
            .then(r => r.json())
            .then(d => { if (d.success) setCollections(d.data.slice(0, 3)); })
            .catch(console.error);
    }, []);

    // Skeleton placeholders while loading
    const items = collections.length > 0
        ? collections
        : [{ _id: '1', name: '', slug: '', description: '', image: '' },
        { _id: '2', name: '', slug: '', description: '', image: '' },
        { _id: '3', name: '', slug: '', description: '', image: '' }];

    return (
        <section className="py-24 px-6 md:px-12 bg-pt-bg text-pt-text">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12">
                <div className="relative">
                    <h2 className="text-3xl font-medium tracking-tight">Featured Collections</h2>
                    <div className="h-1 w-12 bg-pt-clay mt-4"></div>
                </div>
                <Link href="/collections" className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase hover:text-pt-clay transition-colors w-fit">
                    See All Collections <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((col) => (
                    col.slug ? (
                        <Link href={`/collections/${col.slug}`} key={col._id} className="group relative block aspect-[4/5] md:aspect-square overflow-hidden bg-zinc-900 rounded-sm">
                            {col.image
                                ? <img src={col.image} alt={col.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
                                : <div className="absolute inset-0 bg-zinc-800" />
                            }
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 flex flex-col justify-end">
                                <h3 className="text-xl font-bold mb-1">{col.name}</h3>
                                <p className="text-xs text-pt-secondary uppercase tracking-wider">{col.description}</p>
                            </div>
                        </Link>
                    ) : (
                        <div key={col._id} className="aspect-[4/5] md:aspect-square bg-zinc-800 rounded-sm animate-pulse" />
                    )
                ))}
            </div>
        </section>
    );
}
