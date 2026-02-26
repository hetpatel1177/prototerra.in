'use client';

import { motion } from 'framer-motion';

export default function Philosophy() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center bg-pt-bg py-24 relative z-10">
            <div className="max-w-4xl px-6 text-center">

                {/* Headline */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="text-3xl md:text-6xl font-light text-pt-text mb-2 tracking-wide"
                >
                    We do not manufacture objects.
                </motion.h2>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="text-3xl md:text-6xl font-light text-pt-clay mb-12 tracking-wide"
                >
                    We grow them.
                </motion.h2>

                {/* Paragraph */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.7 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    className="text-base md:text-lg text-pt-secondary max-w-2xl mx-auto leading-relaxed font-light"
                >
                    Born from the intersection of ancient earth and precise code.
                    Our process eliminates the boundary between the hand of the artist
                    and the precision of the machine. The result is an object that
                    feels both discovered and invented.
                </motion.p>

            </div>
        </section>
    );
}
