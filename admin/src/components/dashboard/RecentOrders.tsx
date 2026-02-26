'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Order {
    _id: string;
    orderNumber: string;
    customer: { firstName: string; lastName: string; email: string };
    total: number;
    status: string;
    createdAt: string;
}

export function RecentOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`)
            .then(r => r.json())
            .then(d => { if (d.success) setOrders(d.data.slice(0, 5)); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const statusVariant = (s: string) =>
        s === 'delivered' ? 'active' : s === 'pending' ? 'pending' : 'secondary';

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Recent Orders</h3>
                    <p className="text-sm text-muted-foreground">Review latest customer transactions</p>
                </div>
                <Button variant="ghost" className="text-sm text-primary" asChild>
                    <Link href="/orders">View All Orders</Link>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">No orders yet.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ORDER ID</TableHead>
                                <TableHead>CUSTOMER</TableHead>
                                <TableHead>DATE</TableHead>
                                <TableHead>AMOUNT</TableHead>
                                <TableHead>STATUS</TableHead>
                                <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const initials = `${order.customer.firstName?.[0] ?? ''}${order.customer.lastName?.[0] ?? ''}`.toUpperCase();
                                return (
                                    <TableRow key={order._id}>
                                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
                                                    {initials}
                                                </div>
                                                {order.customer.firstName} {order.customer.lastName}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{formatPrice(order.total)}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(order.status)} className="capitalize">
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="text-[#C47A2C] hover:text-[#C47A2C] hover:bg-[rgba(196,122,44,0.10)]" asChild>
                                                <Link href={`/orders/${order._id}`}>
                                                    View
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
