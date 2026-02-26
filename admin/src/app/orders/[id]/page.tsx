'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, RefreshCw, Clock, TruckIcon, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderHistory } from '@/components/orders/OrderHistory';
import { OrderItems } from '@/components/orders/OrderItems';
import { OrderSummary } from '@/components/orders/OrderSummary';
import { CustomerInfoCard } from '@/components/orders/CustomerInfoCard';
import { useParams } from 'next/navigation';

interface Order {
    _id: string;
    orderNumber: string;
    status: string;
    customer: { firstName: string; lastName: string; email: string; address: string; city: string; state: string; zip: string };
    items: { productId: { name: string; images: string[] } | null; quantity: number; price: number }[];
    total: number;
    shippingMethod: string;
    createdAt: string;
    razorpayPaymentId?: string;
    paymentMode?: string;
}

const STATUS_OPTIONS = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-400' },
    { key: 'processing', label: 'Processing', icon: RefreshCw, color: 'text-blue-400' },
    { key: 'shipped', label: 'Shipped', icon: TruckIcon, color: 'text-purple-400' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-green-400' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-400' },
];

export default function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    async function fetchOrder() {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`);
            const data = await res.json();
            if (data.success) setOrder(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function updateStatus(status: string) {
        if (!order) return;
        setUpdating(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${order._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) setOrder(prev => prev ? { ...prev, status } : prev);
        } catch (e) { console.error(e); }
        finally { setUpdating(false); }
    }

    useEffect(() => { fetchOrder(); }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading order...
        </div>
    );

    if (!order) return (
        <div className="py-24 text-center text-muted-foreground">Order not found.</div>
    );

    const currentStatus = STATUS_OPTIONS.find(s => s.key === order.status);
    const StatusIcon = currentStatus?.icon ?? Package;

    return (
        <div className="space-y-6 pb-12">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link href="/orders" className="hover:text-foreground transition-colors">Orders</Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-mono">#{order.orderNumber}</span>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>
                            Customer: <span className="font-medium text-foreground">
                                {order.customer.firstName} {order.customer.lastName}
                            </span>
                        </span>
                        <span>·</span>
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                </div>

                {/* Status updater */}
                <div
                    className="flex items-center gap-3 rounded-sm px-4 py-3"
                    style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                >
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${currentStatus?.color ?? 'text-foreground'}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="capitalize">{order.status}</span>
                    </div>
                    <div className="w-px h-5" style={{ background: '#2a2a2a' }} />
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Update:</span>
                        <select
                            value={order.status}
                            disabled={updating}
                            onChange={e => updateStatus(e.target.value)}
                            className="h-8 rounded-sm border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                        >
                            {STATUS_OPTIONS.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                        {updating && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="col-span-2 space-y-6">
                    <OrderHistory order={order} />
                    <OrderItems order={order} />
                </div>
                <div className="space-y-6">
                    <OrderSummary order={order} />
                    <CustomerInfoCard order={order} />
                </div>
            </div>
        </div>
    );
}
