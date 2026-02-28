'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { Lock, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/formatPrice';
import { useSession } from 'next-auth/react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { items: cartItems, cartTotal, clearCart, syncStock } = useCart();
    const [loading, setLoading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(true);

    // Hooks must be called before any early returns
    const [formData, setFormData] = useState({
        email: session?.user?.email || '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        country: 'United States',
        zip: '',
        phone: '',
        shippingMethod: 'Standard'
    });

    const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

    useEffect(() => {
        if (session?.user?.email) {
            setFormData(prev => ({ ...prev, email: session.user?.email || '' }));
        }
    }, [session]);

    useEffect(() => {
        syncStock().finally(() => setIsSyncing(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/checkout');
        }
    }, [status, router]);

    if (status === 'loading' || isSyncing) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-pt-clay border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm tracking-widest text-zinc-500 uppercase">Verifying Availability...</p>
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return null; // Will redirect
    }

    // Simple redirect if empty
    if (cartItems.length === 0 && typeof window !== 'undefined') {
        // router.push('/cart'); 
    }

    const subtotal = cartTotal;
    const shipping = paymentMethod === 'COD' ? 50 : 0;
    const total = subtotal + shipping;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Order on Backend
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: {
                        email: formData.email,
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        country: formData.country,
                        zip: formData.zip,
                        phone: formData.phone
                    },
                    items: cartItems.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total, // In production, calculate this on backend!
                    shippingMethod: formData.shippingMethod,
                    paymentMode: paymentMethod
                })
            });

            const data = await res.json();

            if (!data.success) {
                console.error('Order creation failed:', data.error);
                alert(data.error || 'Failed to initiate order. Please try again.');
                if (data.outOfStock) {
                    await syncStock();
                    router.push('/cart');
                }
                setLoading(false);
                return;
            }

            // 1b. Handle COD immediately
            if (paymentMethod === 'COD') {
                clearCart();
                router.push(`/orders/${data.data._id}`);
                return;
            }

            const { razorpayOrderId, razorpayKeyId, _id: orderId, orderNumber } = data.data;

            // 2. Open Razorpay Checkout for Online Payment
            const options = {
                key: razorpayKeyId,
                amount: Math.round(total * 100),
                currency: "INR",
                name: "ProtoTerra",
                description: `Order #${orderNumber}`,
                image: "/logo.png", // Ensure this exists or use a default
                order_id: razorpayOrderId,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/verify-payment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            // Success! Redirect to orders page
                            clearCart();
                            router.push(`/orders/${orderId}`);
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Payment processed but verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    contact: formData.phone || "9999999999"
                },
                theme: {
                    color: "#D4A574" // pt-clay
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error(err);
            alert('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
            {/* Load Razorpay Script */}
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Left Column: Form */}
            <div className="w-full md:w-3/5 px-6 md:px-24 pt-8 md:pt-32 pb-12 border-r border-zinc-900 order-2 md:order-1">
                <header className="flex justify-between items-center mb-12">
                    <Link href="/" className="font-bold tracking-widest flex items-center gap-2">
                        <div className="w-4 h-4 bg-pt-clay rounded-md"></div>
                        PROTOTERRA
                    </Link>
                    <Link href="/cart" className="text-pt-clay text-sm flex items-center gap-1 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Return to Cart
                    </Link>
                </header>

                <nav className="text-sm text-zinc-500 mb-8 flex gap-2">
                    <span className="text-pt-clay">Cart</span>
                    <span>{'>'}</span>
                    <span className="text-white">Information</span>
                    <span>{'>'}</span>
                    <span>Shipping</span>
                    <span>{'>'}</span>
                    <span>Payment</span>
                </nav>

                <form onSubmit={handlePayment} className="max-w-xl">
                    {/* Contact Info */}
                    <section className="mb-10">
                        <h2 className="text-xl font-medium mb-4">Contact Information</h2>
                        <div className="mb-4 text-zinc-400 text-sm">
                            Logged in as: <span className="text-white font-medium">{session?.user?.email}</span>
                        </div>
                        <input
                            type="tel"
                            name="phone"
                            required
                            placeholder="Phone (for payment updates)"
                            onChange={handleInputChange}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none transition-colors"
                        />
                    </section>

                    {/* Shipping Address */}
                    <section className="mb-10">
                        <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="text" name="firstName" required placeholder="First Name" onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none" />
                            <input type="text" name="lastName" required placeholder="Last Name" onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none" />
                        </div>
                        <input type="text" name="address" required placeholder="Address" onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 mb-4 focus:border-pt-clay focus:outline-none" />
                        <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 mb-4 focus:border-pt-clay focus:outline-none" />
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="text" name="city" required placeholder="City" onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none" />
                            <input type="text" name="state" required placeholder="State / Province" onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <select name="country" value={formData.country} onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 appearance-none focus:border-pt-clay focus:outline-none text-zinc-400">
                                    <option value="United States">United States</option>
                                    <option value="India">India</option>
                                    <option value="Canada">Canada</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                </select>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">▼</span>
                            </div>
                            <input type="text" name="zip" required placeholder="ZIP / Postal Code" onChange={handleInputChange} className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none" />
                        </div>
                    </section>

                    {/* Shipping Method */}
                    <section className="mb-10">
                        <h2 className="text-xl font-medium mb-4">Shipping Method</h2>
                        <div className="border border-zinc-700 rounded overflow-hidden">
                            <div className="p-4 bg-zinc-800/30">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="font-medium">Standard Shipping</div>
                                    <div className="font-medium text-pt-clay">
                                        {paymentMethod === 'COD' ? '₹50.00' : 'Free'}
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    {paymentMethod === 'COD'
                                        ? 'Cash on Delivery handling fee applied.'
                                        : 'Free shipping on all online payments.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section className="mb-12">
                        <h2 className="text-xl font-medium mb-4">Payment</h2>
                        <div className="border border-zinc-700 rounded overflow-hidden mb-6">
                            {/* RAZORPAY OPTION */}
                            <label className={`flex items-center justify-between p-4 border-b border-zinc-700 cursor-pointer ${paymentMethod === 'RAZORPAY' ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'} transition-colors`}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="RAZORPAY"
                                        checked={paymentMethod === 'RAZORPAY'}
                                        onChange={() => setPaymentMethod('RAZORPAY')}
                                        className="accent-pt-clay w-5 h-5"
                                    />
                                    <div>
                                        <div className="font-medium">Razorpay / UPI / Cards</div>
                                        <div className="text-xs text-zinc-500">Secure online payment</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-black text-[8px] font-bold">UPI</div>
                                    <div className="w-8 h-5 bg-white rounded flex items-center justify-center text-black text-[8px] font-bold">VISA</div>
                                </div>
                            </label>

                            {/* COD OPTION */}
                            <label className={`flex items-center justify-between p-4 cursor-pointer ${paymentMethod === 'COD' ? 'bg-zinc-800/60' : 'hover:bg-zinc-800/30'} transition-colors`}>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        className="accent-pt-clay w-5 h-5"
                                    />
                                    <div>
                                        <div className="font-medium">Cash on Delivery (COD)</div>
                                        <div className="text-xs text-zinc-500">Pay when your order arrives</div>
                                    </div>
                                </div>
                            </label>
                        </div>

                        {paymentMethod === 'RAZORPAY' ? (
                            <div className="border border-zinc-700 rounded p-4 bg-zinc-900/50 flex flex-col items-center text-center">
                                <p className="text-sm text-zinc-400">
                                    After clicking "Complete Order", you will be redirected to Razorpay to complete your purchase securely.
                                </p>
                            </div>
                        ) : (
                            <div className="border border-zinc-700 rounded p-4 bg-zinc-900/50 flex flex-col items-center text-center">
                                <p className="text-sm text-zinc-400">
                                    Pay cash when your order is delivered to your doorstep. Simple and secure.
                                </p>
                            </div>
                        )}
                    </section>

                    <button type="submit" disabled={loading} className="w-full bg-pt-clay text-black font-bold py-4 rounded hover:bg-white transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Complete Order' : 'Pay Now'}
                    </button>

                    <footer className="mt-12 flex justify-between text-xs text-zinc-600 border-t border-zinc-800 pt-8">
                        <Link href="#">Refund Policy</Link>
                        <Link href="#">Shipping Policy</Link>
                        <Link href="#">Terms of Service</Link>
                    </footer>
                </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full md:w-2/5 md:h-screen md:sticky top-0 bg-zinc-900 px-6 md:px-12 pt-24 md:pt-32 pb-12 border-b md:border-b-0 md:border-l border-zinc-800 order-1 md:order-2">
                <h2 className="text-xl font-medium mb-8">Order Summary</h2>
                <div className="space-y-6 mb-8 border-b border-zinc-800 pb-8">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex gap-4">
                            <div className="w-16 h-16 rounded-md relative flex-shrink-0 bg-zinc-900 overflow-hidden">
                                {item.image ? (
                                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800"></div>
                                )}
                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-600 text-white text-xs flex items-center justify-center rounded-full z-10">{item.quantity}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-sm">{item.name}</h3>
                                <p className="text-xs text-zinc-500">{item.variant || 'Standard'}</p>
                            </div>
                            <div className="font-medium text-sm">
                                {formatPrice(item.price)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mb-8 border-b border-zinc-800 pb-8">
                    <input type="text" placeholder="Discount code" className="flex-1 bg-black border border-zinc-700 rounded p-3 focus:border-pt-clay focus:outline-none" />
                    <button className="bg-zinc-800 text-white px-6 rounded hover:bg-zinc-700 transition-colors">Apply</button>
                </div>

                <div className="space-y-2 mb-8 border-b border-zinc-800 pb-8 text-sm">
                    <div className="flex justify-between text-zinc-400">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                        <span>Shipping ({paymentMethod === 'COD' ? 'COD' : 'Standard'})</span>
                        <span className={shipping === 0 ? 'text-green-500' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-xl font-medium">
                    <span>Total</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-zinc-500 text-sm font-normal">INR</span>
                        <span className="text-pt-clay">{formatPrice(total)}</span>
                    </div>
                </div>
            </div>
        </div >
    );
}
