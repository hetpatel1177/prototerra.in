
'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, Package, ExternalLink, ChevronRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { formatPrice } from '@/lib/formatPrice';

interface Order {
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    paymentMode: string;
    createdAt: string;
    items: {
        productId: {
            name: string;
            images: string[];
        };
        quantity: number;
        price: number;
    }[];
    paymentStatus?: string;
}

export default function AccountPage() {
    const { data: session } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session?.user?.email) {
            setLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders?email=${session.user.email}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setOrders(data.data);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [session]);

    if (!session) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-pt-bg text-pt-text">
                <p className="mb-4">Please log in to view your account.</p>
                <Link href="/login" className="bg-pt-clay text-pt-bg px-6 py-2 font-bold uppercase tracking-wider hover:bg-white transition-colors">
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-pt-bg text-pt-text pt-32 pb-24 px-6 md:px-12">
            <h1 className="text-4xl font-bold mb-12">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-zinc-900/50 p-6 rounded-sm border border-zinc-800">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt={session.user.name || 'User'} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-pt-clay">
                                        {(session.user?.email?.[0] || session.user?.name?.[0] || 'U').toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">{session.user?.name || 'User'}</h2>
                                <p className="text-sm text-zinc-500">{session.user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
                        >
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </div>

                {/* Main Content: Order History */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-pt-clay" /> Order History
                    </h2>

                    {loading ? (
                        <div className="text-center py-12 text-zinc-500">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-sm p-8 text-center">
                            <p className="text-zinc-500 mb-4">You haven't placed any orders yet.</p>
                            <Link href="/collections" className="text-pt-clay hover:text-white underline transition-colors">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <div key={order._id} className="bg-zinc-900/30 border border-zinc-800 rounded-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-zinc-700 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">{order.orderNumber}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${order.status === 'delivered' ? 'bg-green-900 text-green-300' :
                                                order.status === 'shipped' ? 'bg-blue-900 text-blue-300' :
                                                    order.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                                                        'bg-yellow-900/30 text-yellow-500'
                                                }`}>
                                                {order.status}
                                            </span>
                                            {
                                                (() => {
                                                    const isCOD = order.paymentMode === 'COD';
                                                    const pStatus = order.paymentStatus || (isCOD ? 'pending' : 'paid');
                                                    return (
                                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${pStatus === 'paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                                                            {pStatus}
                                                        </span>
                                                    );
                                                })()
                                            }
                                            <span className="text-[10px] uppercase font-bold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-sm">
                                                {order.paymentMode}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                        <div className="flex -space-x-2 pt-2">
                                            {order.items.slice(0, 3).map((item, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border border-zinc-900 bg-zinc-800 overflow-hidden relative">
                                                    {item.productId?.images?.[0] && (
                                                        <img src={item.productId.images[0]} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="w-8 h-8 rounded-full border border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400">
                                                    +{order.items.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1">
                                        <span className="text-xl font-bold text-pt-clay">{formatPrice(order.total)}</span>
                                        <Link
                                            href={`/orders/${order.orderNumber}`}
                                            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
                                        >
                                            View Details <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
