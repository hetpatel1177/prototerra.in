'use client';

export default function CollectionsNav({ collections }: { collections: any[] }) {
    function handleScrollTo(slug: string) {
        document.getElementById(`collection-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return (
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
    );
}
