export default function Loading() {
    return (
        <div className="min-h-screen bg-pt-bg pt-40 px-6">
            <div className="max-w-[1400px] mx-auto">
                <div className="h-20 w-3/4 bg-zinc-900 rounded-sm animate-pulse mb-8" />
                <div className="h-4 w-1/2 bg-zinc-900 rounded-sm animate-pulse mb-12" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-[3/4] bg-zinc-900 rounded-sm animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
