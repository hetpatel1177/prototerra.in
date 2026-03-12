import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="bg-pt-bg text-pt-text min-h-screen pt-32 pb-20 px-6">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">Privacy Policy</h1>
                
                <div className="space-y-12 text-pt-secondary leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">1. Information Collection</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or subscribe to our newsletter. This may include your name, email address, shipping address, and payment information.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">2. Use of Information</h2>
                        <p>We use the information we collect to process your orders, communicate with you about our products and services, and improve your overall experience on our website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">3. Data Security</h2>
                        <p>We implement a variety of security measures to maintain the safety of your personal information. Your sensitive information is encrypted and transmitted securely.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">4. Third-Party Disclosure</h2>
                        <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except to provide the services you've requested (such as shipping providers).</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">5. Cookies</h2>
                        <p>Our website uses cookies to enhance your browsing experience and gather data about site traffic and interaction so that we can offer better site experiences in the future.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-pt-text mb-4">6. Your Rights</h2>
                        <p>You have the right to access, correct, or delete your personal information at any time. Please contact us if you wish to exercise these rights.</p>
                    </section>
                </div>
                
                <div className="mt-20 pt-12 border-t border-zinc-900 text-sm opacity-50 uppercase tracking-widest">
                    Last updated: March 12, 2026
                </div>
            </div>
        </div>
    );
}
