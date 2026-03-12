import React from 'react';

export default function TermsPage() {
    return (
        <div className="bg-pt-bg text-pt-text min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">Terms of Service</h1>
                
                <div className="space-y-12 text-pt-secondary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">1. Introduction</h2>
                        <p>Welcome to ProtoTerra. These Terms of Service govern your use of our website and services. By accessing or using our site, you agree to be bound by these terms.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">2. Artisanal Nature</h2>
                        <p>All our products are handcrafted using traditional ceramic techniques. Due to their artisanal nature, each item is unique. Slight variations in color, texture, and dimensions are to be expected and are part of the artistic value of the piece.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">3. Orders and Payment</h2>
                        <p>Prices are subject to change without notice. We reserve the right to refuse or cancel any order. Payments are processed securely through our authorized payment gateways.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">4. Shipping and Returns</h2>
                        <p>Shipping times are estimates. Please refer to our Shipping Policy for detailed information. Due to the fragile nature of ceramics, we take extreme care in packaging. If an item arrives damaged, please contact us within 48 hours.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">5. Intellectual Property</h2>
                        <p>All content on this site, including designs, text, and images, is the property of ProtoTerra and is protected by international copyright laws.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">6. Limitation of Liability</h2>
                        <p>ProtoTerra shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website.</p>
                    </section>
                </div>
                
                <div className="mt-20 pt-12 border-t border-zinc-900 text-sm opacity-50 uppercase tracking-widest">
                    Last updated: March 12, 2026
                </div>
            </div>
        </div>
    );
}
