'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Search, Loader2, ExternalLink, ShoppingCart,
    Clock, TruckIcon, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Order {
    _id: string;
    orderNumber: string;
    customer: { firstName: string; lastName: string; email: string };
    total: number;
    status: string;
    shippingMethod: string;
    createdAt: string;
    items: { quantity: number; price: number }[];
    paymentMode?: string;
    paymentStatus?: string;
    razorpayPaymentId?: string;
}

const STATUS_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

function statusBadgeVariant(s: string) {
    switch (s) {
        case 'delivered': return 'active';
        case 'pending': return 'pending';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
}

function statusIcon(s: string) {
    switch (s) {
        case 'pending': return <Clock className="h-3 w-3" />;
        case 'processing': return <RefreshCw className="h-3 w-3" />;
        case 'shipped': return <TruckIcon className="h-3 w-3" />;
        case 'delivered': return <CheckCircle2 className="h-3 w-3" />;
        case 'cancelled': return <XCircle className="h-3 w-3" />;
        default: return null;
    }
}

function OrdersPageContent() {
    const searchParams = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        const q = searchParams.get('search');
        if (q !== null) setSearch(q);
    }, [searchParams]);

    async function fetchOrders() {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
            const data = await res.json();
            if (data.success) setOrders(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    async function updateStatus(id: string, status: string) {
        setUpdatingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
            }
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    }

    async function updatePaymentStatus(id: string, paymentStatus: string) {
        setUpdatingId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}/payment-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setOrders(prev => prev.map(o => o._id === id ? { ...o, paymentStatus } : o));
            }
        } catch (e) { console.error(e); }
        finally { setUpdatingId(null); }
    }

    useEffect(() => { fetchOrders(); }, []);

    const filtered = useMemo(() => orders.filter(o => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer.email.toLowerCase().includes(q) ||
            `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchSearch && matchStatus;
    }), [orders, search, statusFilter]);

    // Live stats
    const totalOrders = filtered.length;
    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const pendingCount = filtered.filter(o => {
        const isCOD = o.paymentMode === 'COD';
        const pStatus = (o.paymentStatus || (isCOD ? 'pending' : 'paid')).toLowerCase();
        return pStatus === 'pending';
    }).length;
    const shippedCount = filtered.filter(o => o.status === 'shipped').length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all customer orders.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchOrders}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Live stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Orders', value: loading ? '—' : totalOrders, color: 'text-[#F5F5F5]' },
                    { label: 'Total Revenue', value: loading ? '—' : formatPrice(totalRevenue), color: 'text-[#C47A2C]' },
                    { label: 'Pending Payment', value: loading ? '—' : pendingCount, color: pendingCount > 0 ? 'text-yellow-400' : 'text-[#F5F5F5]' },
                    { label: 'Shipped', value: loading ? '—' : shippedCount, color: shippedCount > 0 ? 'text-blue-400' : 'text-[#F5F5F5]' },
                ].map(stat => (
                    <div
                        key={stat.label}
                        className="rounded-sm px-4 py-3"
                        style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                    >
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">{stat.label}</p>
                        {loading
                            ? <Loader2 className="h-4 w-4 animate-spin mt-1 text-[#9A9A9A]" />
                            : <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                        }
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by order #, name, or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex h-10 w-full rounded-sm border border-input bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>

                {/* Status pill tabs */}
                <div
                    className="flex items-center rounded-sm p-1 gap-0.5"
                    style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                >
                    {STATUS_OPTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setStatusFilter(s.key)}
                            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${statusFilter === s.key
                                ? 'bg-[#C47A2C] text-[#050505]'
                                : 'text-[#9A9A9A] hover:text-[#F5F5F5]'
                                }`}
                        >
                            {s.label}
                            {s.key !== 'all' && !loading && (
                                <span className="ml-1.5 opacity-60">
                                    {orders.filter(o => {
                                        const q = search.toLowerCase();
                                        const matchSearch = !q ||
                                            o.orderNumber.toLowerCase().includes(q) ||
                                            o.customer.email.toLowerCase().includes(q) ||
                                            `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase().includes(q);
                                        return matchSearch && o.status === s.key;
                                    }).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {!loading && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {filtered.length} of {totalOrders} orders
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="rounded-sm border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading orders...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <ShoppingCart className="h-10 w-10 opacity-30" />
                        <p className="text-sm">
                            {orders.length === 0 ? 'No orders yet.' : 'No orders match your filters.'}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ORDER #</TableHead>
                                <TableHead>CUSTOMER</TableHead>
                                <TableHead>DATE</TableHead>
                                <TableHead>ITEMS</TableHead>
                                <TableHead>SHIPPING</TableHead>
                                <TableHead>AMOUNT</TableHead>
                                <TableHead>PAYMENT</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(order => {
                                const initials = `${order.customer.firstName?.[0] ?? ''}${order.customer.lastName?.[0] ?? ''}`.toUpperCase();
                                const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;
                                // Inferred payment info
                                const isCOD = order.paymentMode === 'COD';
                                const paymentMethod = isCOD ? 'Cash on Delivery' : (order.razorpayPaymentId ? 'Razorpay' : 'Online');
                                const paymentStatus = order.paymentStatus || (isCOD ? 'pending' : 'paid');
                                const paymentColor = paymentStatus === 'pending' ? 'text-yellow-400' : 'text-green-500';

                                return (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-mono text-xs text-[#C47A2C]">
                                            #{order.orderNumber}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="h-8 w-8 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'rgba(196,122,44,0.12)', color: '#C47A2C' }}
                                                >
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{order.customer.firstName} {order.customer.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{order.customer.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            <div>
                                                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                <p className="text-xs opacity-60">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {order.shippingMethod || 'Standard'}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            {formatPrice(order.total)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    {updatingId === order._id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        paymentStatus === 'pending' ? <Clock className={`h-3 w-3 ${paymentColor}`} /> : <CheckCircle2 className={`h-3 w-3 ${paymentColor}`} />
                                                    )}
                                                    <select
                                                        value={paymentStatus.toLowerCase()}
                                                        disabled={updatingId === order._id}
                                                        onChange={e => updatePaymentStatus(order._id, e.target.value)}
                                                        className={`h-7 rounded-sm border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 capitalize font-medium ${paymentColor}`}
                                                    >
                                                        <option value="pending" className="text-yellow-400">Pending</option>
                                                        <option value="paid" className="text-green-500">Paid</option>
                                                    </select>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    {paymentMethod}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {/* Inline status updater */}
                                            <div className="flex items-center gap-1.5">
                                                {updatingId === order._id
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                                    : statusIcon(order.status)
                                                }
                                                <select
                                                    value={order.status}
                                                    disabled={updatingId === order._id}
                                                    onChange={e => updateStatus(order._id, e.target.value)}
                                                    className="h-7 rounded-sm border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 capitalize"
                                                >
                                                    {STATUS_OPTIONS.filter(s => s.key !== 'all').map(s => (
                                                        <option key={s.key} value={s.key}>{s.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild className="text-[#C47A2C] hover:text-[#C47A2C] hover:bg-[rgba(196,122,44,0.10)]">
                                                <Link href={`/orders/${order._id}`}>
                                                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <OrdersPageContent />
        </Suspense>
    );
}
