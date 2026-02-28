'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Search, Loader2, Users, TrendingUp, UserPlus,
    ShoppingBag, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Order {
    _id: string;
    orderNumber: string;
    customer: { firstName: string; lastName: string; email: string };
    total: number;
    status: string;
    createdAt: string;
    items: { quantity: number }[];
}

interface Customer {
    email: string;
    firstName: string;
    lastName: string;
    orderCount: number;
    lifetimeValue: number;
    lastOrderDate: string;
    firstOrderDate: string;
    statuses: string[];
}

type SortKey = 'lifetimeValue' | 'orderCount' | 'lastOrderDate' | 'name';
type FilterKey = 'all' | 'active' | 'new' | 'returning';

function aggregateCustomers(orders: Order[]): Customer[] {
    const map = new Map<string, Customer>();
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    for (const order of orders) {
        const email = order.customer?.email;
        if (!email) continue;
        if (map.has(email)) {
            const c = map.get(email)!;
            c.orderCount++;
            c.lifetimeValue += order.total;
            c.statuses.push(order.status);
            if (new Date(order.createdAt) > new Date(c.lastOrderDate)) c.lastOrderDate = order.createdAt;
            if (new Date(order.createdAt) < new Date(c.firstOrderDate)) c.firstOrderDate = order.createdAt;
        } else {
            map.set(email, {
                email,
                firstName: order.customer.firstName,
                lastName: order.customer.lastName,
                orderCount: 1,
                lifetimeValue: order.total,
                lastOrderDate: order.createdAt,
                firstOrderDate: order.createdAt,
                statuses: [order.status],
            });
        }
    }
    return Array.from(map.values());
}

function isNewThisMonth(c: Customer) {
    const d = new Date(c.firstOrderDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export default function CustomersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterKey>('all');
    const [sortKey, setSortKey] = useState<SortKey>('lifetimeValue');
    const [sortAsc, setSortAsc] = useState(false);

    async function fetchOrders() {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`);
            const data = await res.json();
            if (data.success) setOrders(data.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }

    useEffect(() => { fetchOrders(); }, []);

    const allCustomers = useMemo(() => aggregateCustomers(orders), [orders]);

    // Stats
    const totalCustomers = allCustomers.length;
    const totalRevenue = allCustomers.reduce((s, c) => s + c.lifetimeValue, 0);
    const avgLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const newThisMonth = allCustomers.filter(isNewThisMonth).length;
    const returning = allCustomers.filter(c => c.orderCount > 1).length;

    // Filter
    const filtered = useMemo(() => {
        let list = allCustomers;

        if (filter === 'new') list = list.filter(isNewThisMonth);
        else if (filter === 'returning') list = list.filter(c => c.orderCount > 1);
        else if (filter === 'active') list = list.filter(c => {
            const days = (Date.now() - new Date(c.lastOrderDate).getTime()) / 86400000;
            return days <= 90;
        });

        if (search) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q)
            );
        }

        return [...list].sort((a, b) => {
            let diff = 0;
            if (sortKey === 'lifetimeValue') diff = a.lifetimeValue - b.lifetimeValue;
            else if (sortKey === 'orderCount') diff = a.orderCount - b.orderCount;
            else if (sortKey === 'lastOrderDate') diff = new Date(a.lastOrderDate).getTime() - new Date(b.lastOrderDate).getTime();
            else if (sortKey === 'name') diff = `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`);
            return sortAsc ? diff : -diff;
        });
    }, [allCustomers, search, filter, sortKey, sortAsc]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortAsc(v => !v);
        else { setSortKey(key); setSortAsc(false); }
    }

    function SortIcon({ k }: { k: SortKey }) {
        if (sortKey !== k) return null;
        return sortAsc
            ? <ChevronUp className="h-3 w-3 inline ml-1" />
            : <ChevronDown className="h-3 w-3 inline ml-1" />;
    }

    const FILTERS: { key: FilterKey; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: totalCustomers },
        { key: 'active', label: 'Active', count: allCustomers.filter(c => (Date.now() - new Date(c.lastOrderDate).getTime()) / 86400000 <= 90).length },
        { key: 'new', label: 'New', count: newThisMonth },
        { key: 'returning', label: 'Returning', count: returning },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground mt-1">Overview of your client base and their engagement.</p>
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

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Total Customers', value: loading ? null : totalCustomers, icon: Users, color: 'text-[#F5F5F5]' },
                    { label: 'Avg. Lifetime Value', value: loading ? null : formatPrice(avgLTV), icon: TrendingUp, color: 'text-[#C47A2C]' },
                    { label: 'New This Month', value: loading ? null : newThisMonth, icon: UserPlus, color: newThisMonth > 0 ? 'text-green-400' : 'text-[#F5F5F5]' },
                    { label: 'Returning', value: loading ? null : returning, icon: ShoppingBag, color: 'text-blue-400' },
                ].map(stat => (
                    <div
                        key={stat.label}
                        className="rounded-sm px-4 py-3 flex items-start gap-3"
                        style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                    >
                        <div
                            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm"
                            style={{ background: 'rgba(196,122,44,0.10)' }}
                        >
                            <stat.icon className="h-4 w-4 text-[#C47A2C]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">{stat.label}</p>
                            {stat.value === null
                                ? <Loader2 className="h-4 w-4 animate-spin mt-1 text-[#9A9A9A]" />
                                : <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
                            }
                        </div>
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
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex h-10 w-full rounded-sm border border-input bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>

                {/* Filter tabs */}
                <div
                    className="flex items-center rounded-sm p-1 gap-0.5"
                    style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                >
                    {FILTERS.map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${filter === f.key
                                ? 'bg-[#C47A2C] text-[#050505]'
                                : 'text-[#9A9A9A] hover:text-[#F5F5F5]'
                                }`}
                        >
                            {f.label}
                            {!loading && (
                                <span className="ml-1.5 opacity-60">{f.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {!loading && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {filtered.length} of {totalCustomers} customers
                    </span>
                )}
            </div>

            {/* Table */}
            <div className="rounded-sm border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading customers...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <Users className="h-10 w-10 opacity-30" />
                        <p className="text-sm">
                            {allCustomers.length === 0 ? 'No customers yet.' : 'No customers match your filters.'}
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer select-none hover:text-foreground"
                                    onClick={() => toggleSort('name')}
                                >
                                    CUSTOMER <SortIcon k="name" />
                                </TableHead>
                                <TableHead>EMAIL</TableHead>
                                <TableHead
                                    className="text-center cursor-pointer select-none hover:text-foreground"
                                    onClick={() => toggleSort('orderCount')}
                                >
                                    ORDERS <SortIcon k="orderCount" />
                                </TableHead>
                                <TableHead
                                    className="text-right cursor-pointer select-none hover:text-foreground"
                                    onClick={() => toggleSort('lifetimeValue')}
                                >
                                    LIFETIME VALUE <SortIcon k="lifetimeValue" />
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer select-none hover:text-foreground"
                                    onClick={() => toggleSort('lastOrderDate')}
                                >
                                    LAST ORDER <SortIcon k="lastOrderDate" />
                                </TableHead>
                                <TableHead>TYPE</TableHead>
                                <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map(c => {
                                const initials = `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase();
                                const isNew = isNewThisMonth(c);
                                const isReturning = c.orderCount > 1;
                                const todayStr = new Date().setHours(0, 0, 0, 0);
                                const orderStr = new Date(c.lastOrderDate).setHours(0, 0, 0, 0);
                                const daysSinceLast = Math.round((todayStr - orderStr) / 86400000);

                                return (
                                    <TableRow key={c.email}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-8 w-8 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'rgba(196,122,44,0.12)', color: '#C47A2C' }}
                                                >
                                                    {initials}
                                                </div>
                                                <span className="font-medium">{c.firstName} {c.lastName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{c.email}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="font-medium">{c.orderCount}</span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-[#C47A2C]">
                                            {formatPrice(c.lifetimeValue)}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="text-sm">{new Date(c.lastOrderDate).toLocaleDateString()}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {daysSinceLast === 0 ? 'Today' : daysSinceLast === 1 ? 'Yesterday' : `${daysSinceLast}d ago`}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm"
                                                style={
                                                    isNew
                                                        ? { background: 'rgba(74,222,128,0.12)', color: '#4ade80' }
                                                        : isReturning
                                                            ? { background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }
                                                            : { background: 'rgba(156,163,175,0.12)', color: '#9ca3af' }
                                                }
                                            >
                                                {isNew ? 'New' : isReturning ? 'Returning' : 'One-time'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[#C47A2C] hover:text-[#C47A2C] hover:bg-[rgba(196,122,44,0.10)] gap-1.5 text-xs"
                                                asChild
                                            >
                                                <Link href={`/orders?search=${encodeURIComponent(c.email)}`}>
                                                    <ExternalLink className="h-3 w-3" />
                                                    View Orders
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
