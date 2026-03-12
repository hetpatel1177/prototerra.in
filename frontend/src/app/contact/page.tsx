
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        orderId: '',
        message: '',
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
                setFormData({ name: '', email: '', subject: 'General Inquiry', orderId: '', message: '' });
            } else {
                setErrorMessage(data.error || 'Something went wrong.');
                setStatus('error');
            }
        } catch (error) {
            setErrorMessage('Network error. Please try again.');
            setStatus('error');
        }
    };

    return (
        <main className="min-h-screen bg-pt-bg pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
            <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12">

                {/* Description Column */}
                <div className="space-y-8">
                    <div>
                        <span className="text-pt-clay text-xs tracking-[0.3em] uppercase block mb-4">Get in Touch</span>
                        <h1 className="text-4xl font-bold leading-tight">We're Here to Help</h1>
                    </div>
                    <p className="text-pt-secondary leading-relaxed">
                        Whether you have a question about our collections, need assistance with an order, or are interested in custom commissions, our team is ready to assist you.
                    </p>

                    <div className="space-y-4 pt-4 border-t border-zinc-900">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Email</h3>
                            <a href="mailto:admin@prototerra.in" className="text-pt-clay hover:underline">admin@prototerra.in</a>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Studio</h3>
                            <p className="text-pt-secondary text-sm">
                                44, Tirupati Park Bunglows, Visnagar Road<br />
                                Vijapur-382870
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Column */}
                <div className="bg-zinc-900/30 border border-zinc-800 p-8 md:p-10 rounded-sm">
                    {status === 'success' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
                        >
                            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Message Sent</h3>
                            <p className="text-pt-secondary">Thank you for reaching out. We'll get back to you shortly.</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-8 text-pt-clay hover:underline text-sm font-medium"
                            >
                                Send another message
                            </button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-pt-secondary">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-pt-clay rounded-sm px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-pt-secondary">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-pt-clay rounded-sm px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-pt-secondary">Subject</label>
                                <select
                                    id="subject"
                                    className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-pt-clay rounded-sm px-4 py-3 text-sm text-white outline-none transition-colors appearance-none"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Return">Return / Exchange</option>
                                    <option value="Product Fault">Report a Fault</option>
                                    <option value="Customization">Custom Commission</option>
                                </select>
                            </div>

                            {(formData.subject === 'Return' || formData.subject === 'Product Fault') && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <label htmlFor="orderId" className="text-xs font-bold uppercase tracking-widest text-pt-secondary">Order ID</label>
                                    <input
                                        type="text"
                                        id="orderId"
                                        className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-pt-clay rounded-sm px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors"
                                        placeholder="e.g. ORD-12345"
                                        value={formData.orderId}
                                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                    />
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-pt-secondary">Message</label>
                                <textarea
                                    id="message"
                                    required
                                    rows={5}
                                    className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-pt-clay rounded-sm px-4 py-3 text-sm text-white placeholder-zinc-700 outline-none transition-colors resize-none"
                                    placeholder="How can we help you?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-red-500 text-sm">{errorMessage}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-pt-clay text-pt-bg font-bold uppercase tracking-widest py-4 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
