
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, MapPin, Calendar, Printer } from 'lucide-react';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/formatPrice';

interface OrderItem {
    productId: {
        name: string;
        images: string[];
    };
    quantity: number;
    price: number;
    variant?: string; // If added to schema later
}

interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        email: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
    };
    items: OrderItem[];
    total: number;
    status: string;
    paymentMode: string;
    paymentStatus?: string;
    createdAt: string;
}

export default function OrderConfirmationPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchOrder() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrder();
    }, [id]);

    const getEstimatedDelivery = (createdAt: string) => {
        const start = new Date(createdAt);
        start.setDate(start.getDate() + 4);

        const end = new Date(createdAt);
        end.setDate(end.getDate() + 7);

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    const handleTrackOrder = () => {
        alert(`Tracking details have been sent to ${order?.customer.email}`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading order...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Order not found.</div>;

    // Calculate Subtotal and Shipping dynamically
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = order.total - subtotal;
    // If shipping is negative or weird (due to rounding or discount logic), default to 0
    const displayShipping = shipping > 0 ? shipping : 0;

    return (
        <main className="min-h-screen bg-black text-white py-24 px-6 md:px-12 print:p-0 print:bg-white print:text-black">
            {/* Header - Hidden on Print */}
            <div className="max-w-3xl mx-auto text-center mb-16 print:hidden">
                <div className="w-16 h-16 bg-pt-clay/20 text-pt-clay rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Thank you, {order.customer.firstName}.</h1>
                <p className="text-zinc-400">
                    Your artisanal pieces are being prepared. A confirmation email has been sent to <span className="text-white font-medium">{order.customer.email}</span>.
                </p>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block text-center mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">ProtoTerra</h1>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Artisanal Ceramics</p>
                <div className="mt-4 text-left">
                    <p className="font-bold text-lg">Order Receipt</p>
                    <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800 print:bg-white print:border-gray-200 print:border-0 print:shadow-none">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-zinc-800 to-zinc-900 p-6 md:p-8 flex justify-between items-center border-b border-zinc-700 print:bg-white print:from-white print:to-white print:border-gray-300 print:p-0 print:pb-4 print:mb-4">
                    <div>
                        <div className="text-xs text-pt-clay font-bold tracking-widest uppercase mb-1 print:text-black">
                            {(() => {
                                const isCOD = order.paymentMode === 'COD';
                                const pStatus = order.paymentStatus || (isCOD ? 'pending' : 'paid');
                                return (
                                    <>
                                        Status: {order.status} | Payment: {order.paymentMode === 'COD' ? 'COD' : 'Online'} <span className={
                                            pStatus === 'paid' ? 'text-green-500' :
                                                pStatus === 'failed' ? 'text-red-500' : 'text-yellow-500'
                                        }>({pStatus})</span>
                                    </>
                                );
                            })()}
                        </div>
                        <h2 className="text-2xl font-bold print:text-xl">Order #{order.orderNumber}</h2>
                    </div>
                    <button
                        onClick={handleTrackOrder}
                        className="border border-zinc-600 text-xs uppercase tracking-wider px-4 py-2 hover:bg-white hover:text-black transition-colors rounded-sm print:hidden"
                    >
                        Track Order
                    </button>
                </div>

                {/* Items */}
                <div className="p-6 md:p-8 border-b border-zinc-800 print:p-0 print:border-gray-200 print:mb-6">
                    <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-6 print:text-gray-600 print:mb-4">Order Summary</h3>
                    <div className="space-y-6 print:space-y-4">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex gap-6 items-center print:border-b print:border-gray-100 print:pb-4">
                                <div className="w-16 h-16 bg-zinc-800 rounded-sm relative overflow-hidden print:bg-gray-100 print:border print:border-gray-200">
                                    {item.productId?.images?.[0] && (
                                        <Image src={item.productId.images[0]} alt={item.productId.name} fill sizes="64px" className="object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold print:text-sm">{item.productId?.name || 'Product'}</h4>
                                    <p className="text-sm text-zinc-500 print:text-xs print:text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <div className="font-bold print:text-sm">
                                    {formatPrice(item.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="p-6 md:p-8 bg-zinc-900/50 border-b border-zinc-800 print:bg-white print:p-0 print:border-gray-200 print:mb-6">
                    <div className="flex justify-between mb-2 text-zinc-400 text-sm print:text-gray-600 print:mb-1">
                        <span>Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-zinc-400 text-sm print:text-gray-600 print:mb-1">
                        <span>Shipping (Carbon Neutral)</span>
                        <span>{displayShipping === 0 ? 'Free' : formatPrice(displayShipping)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-800 print:border-gray-300 print:mt-2 print:pt-2">
                        <span className="font-bold text-lg print:text-base">Total Paid ({order.paymentMode})</span>
                        <span className="font-bold text-xl text-pt-clay print:text-black print:text-lg">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800 print:bg-white print:grid-cols-2 print:gap-8">
                    <div className="bg-zinc-900 p-6 md:p-8 print:bg-white print:p-0">
                        <div className="flex items-center gap-3 mb-4 text-pt-clay print:text-black print:mb-2">
                            <MapPin className="w-5 h-5 print:w-4 print:h-4" />
                            <h4 className="font-bold text-xs tracking-widest uppercase">Shipping Address</h4>
                        </div>
                        <address className="not-italic text-zinc-400 text-sm leading-relaxed print:text-gray-800">
                            {order.customer.firstName} {order.customer.lastName}<br />
                            {order.customer.address}<br />
                            {order.customer.city}, {order.customer.state} {order.customer.zip}<br />
                            {/* Assuming country is fixed or stored, defaulting text for now unless in schema */}
                            United States
                        </address>
                    </div>
                    <div className="bg-zinc-900 p-6 md:p-8 print:bg-white print:p-0">
                        <div className="flex items-center gap-3 mb-4 text-pt-clay print:text-black print:mb-2">
                            <Calendar className="w-5 h-5 print:w-4 print:h-4" />
                            <h4 className="font-bold text-xs tracking-widest uppercase">Estimated Delivery</h4>
                        </div>
                        <p className="text-white text-lg font-medium mb-1 print:text-black print:text-base">
                            {getEstimatedDelivery(order.createdAt)}
                        </p>
                        <p className="text-zinc-500 text-sm print:text-gray-500">Via Terra Express Logistics</p>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                <p>Thank you for shopping with ProtoTerra.</p>
                <p>www.prototerra.in | admin@prototerra.in</p>
            </div>

            {/* Action Buttons - Hidden on Print */}
            <div className="max-w-4xl mx-auto mt-12 flex justify-center gap-6 print:hidden">
                <Link href="/" className="bg-pt-clay text-black px-8 py-3 font-bold uppercase tracking-wider rounded-sm hover:bg-white transition-colors">
                    Continue Shopping
                </Link>
                <button
                    onClick={() => window.print()}
                    className="border border-zinc-700 px-8 py-3 flex items-center gap-2 uppercase tracking-wider text-xs hover:border-pt-clay hover:text-pt-clay transition-colors rounded-sm"
                >
                    <Printer className="w-4 h-4" /> Print Receipt
                </button>
            </div>
        </main>
    );
}
