
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sustainability & Ethical Craft | ProtoTerra - Eco-Friendly Ceramics',
    description: 'Discover how ProtoTerra champions sustainable pottery, ethical craftsmanship, and eco-friendly design using natural clay and zero-waste practices.',
    keywords: ['Sustainable ceramics', 'Eco-friendly pottery', 'Natural clay', 'Ethical craftsmanship', 'Zero waste design', 'Slow living', 'Artisanal stoneware'],
};

export default function SustainabilityPage() {
    return (
        <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 px-6 md:px-12">
            <article className="max-w-3xl mx-auto space-y-20">

                {/* Header / Hero */}
                <header className="space-y-8 text-center">
                    <span className="text-pt-clay text-xs tracking-[0.3em] uppercase block font-bold">Conscious Living</span>
                    <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                        Crafting with <span className="text-pt-clay">Conscience</span>
                    </h1>
                    <p className="text-lg md:text-xl text-pt-secondary max-w-xl mx-auto leading-relaxed font-light">
                        Our journey towards a sustainable future through mindful design, natural materials, and ethical production.
                    </p>
                </header>

                {/* Hero Image Block */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-zinc-900 border border-zinc-800/50 group">
                    {/* Placeholder text for visual balance */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 space-y-4">
                        <div className="w-16 h-[1px] bg-zinc-800"></div>
                        <span className="text-xs tracking-[0.2em] uppercase opacity-60">The Essence of Earth</span>
                        <div className="w-16 h-[1px] bg-zinc-800"></div>
                    </div>
                    {/* If an image asset becomes available, insert <Image /> here */}
                </div>

                {/* Content Section 1: The Material */}
                <section className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Rooted in the Earth: Natural Materials</h2>
                    <div className="space-y-6 text-pt-secondary/90 text-lg leading-loose font-light">
                        <p>
                            At the heart of ProtoTerra lies a profound respect for our primary medium: <strong className="text-pt-clay font-medium">clay</strong>.
                            Unlike mass-produced ceramics that often rely on synthetic additives and heavy industrial processing,
                            our <strong>eco-friendly pottery</strong> is sourced directly from sustainable riverbeds and local quarries.
                            We champion the use of raw, unrefined earth, celebrating its imperfections and reducing the carbon footprint associated with material transport.
                        </p>
                        <p>
                            By prioritizing <strong>natural materials</strong>, we ensure that every piece we create is not just biodegradable but also free from harmful glazes.
                            Our commitment to <strong>non-toxic craftsmanship</strong> means safer homes for our customers and a cleaner environment for our planet.
                        </p>
                    </div>
                </section>

                {/* Content Section 2: The Process */}
                <section className="border-t border-zinc-800/50 pt-16 space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">The Slow Design Movement</h2>
                    <div className="space-y-6 text-pt-secondary/90 text-lg leading-loose font-light">
                        <p>
                            In a world obsessed with speed, we embrace the philosophy of <strong>Slow Design</strong>.
                            Our artisans employ traditional, time-honored techniques that require patience and precision.
                            This deliberate pace minimizes energy consumption, as many of our forms are hand-thrown or hand-built without the need for electricity-heavy machinery.
                        </p>
                        <p>
                            This approach isn't just about aesthetics; it's a stance against disposable culture.
                            We create <strong>heirloom-quality stoneware</strong> designed to last for generations, countering the "buy-and-throw" mentality
                            that contributes to global waste.
                        </p>
                    </div>
                </section>

                {/* Content Section 3: Zero Waste */}
                <section className="border-t border-zinc-800/50 pt-16 space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">Towards Zero Waste Production</h2>
                    <div className="space-y-6 text-pt-secondary/90 text-lg leading-loose font-light">
                        <p>
                            Sustainability is a cycle, not a destination. Our studio operates on a strict <strong>zero-waste protocol</strong>.
                            Unfired clay scraps are reclaimed, re-wedged, and given new life in future batches.
                            Even our firing process is optimized to maximize kiln space, ensuring energy efficiency in every cycle.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            {[
                                'Reclaimed clay bodies for 100% material utilization.',
                                'Plastic-free, biodegradable packaging materials.',
                                'Carbon-neutral shipping partners.',
                                'Supporting local economies to reduce supply chain emissions.'
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-base">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pt-clay mt-2.5 flex-shrink-0"></span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* Footer Note */}
                <div className="bg-zinc-900/30 border border-zinc-800/50 p-10 rounded-sm mt-16 text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">Join the Movement</h3>
                    <p className="text-sm text-pt-secondary max-w-md mx-auto leading-relaxed">
                        Every purchase supports a cleaner, greener earth. Choose mindful living with ProtoTerra.
                    </p>
                </div>

            </article>
        </main>
    );
}
