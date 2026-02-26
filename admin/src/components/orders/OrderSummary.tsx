import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
interface OrderItem {
    quantity: number;
    price: number;
}

interface Order {
    total: number;
    shippingMethod: string;
    items: OrderItem[];
    razorpayPaymentId?: string;
    paymentMode?: string;
    paymentStatus?: string;
}

export function OrderSummary({ order }: { order: Order }) {
    // Calculate real subtotal from items
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = order.total - subtotal;
    const isFreeShipping = shipping <= 0;

    const isCOD = order.paymentMode === 'COD';
    const paymentStatus = order.paymentStatus || (isCOD ? 'pending' : 'paid');
    const paymentMethod = isCOD ? 'Cash on Delivery' : (order.razorpayPaymentId ? 'Razorpay' : 'Online');

    return (
        <Card style={{ background: '#161616', border: '1px solid #2a2a2a' }}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#9A9A9A]">
                    <Receipt className="h-4 w-4 text-[#C47A2C]" />
                    Order Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({order.items.length} items)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                        Shipping <span className="text-xs">({order.shippingMethod || 'Standard'})</span>
                    </span>
                    <span className={isFreeShipping ? 'text-green-400 font-medium' : 'font-medium'}>
                        {isFreeShipping ? 'Free' : formatPrice(shipping)}
                    </span>
                </div>
                <div
                    className="flex justify-between pt-3 mt-1"
                    style={{ borderTop: '1px solid #2a2a2a' }}
                >
                    <span className="font-bold text-[#F5F5F5]">Total</span>
                    <span className="text-xl font-bold text-[#C47A2C]">{formatPrice(order.total)}</span>
                </div>

                <div className="pt-4 mt-2 border-t border-[#2a2a2a]">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#9A9A9A] mb-2">Payment Details</h4>
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Method</span>
                            <span className="font-medium text-[#F5F5F5]">
                                {paymentMethod}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium capitalize ${paymentStatus === 'pending' ? 'text-yellow-400' : 'text-green-400'}`}>
                                {paymentStatus}
                            </span>
                        </div>
                        {order.razorpayPaymentId && !isCOD && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Trans. ID</span>
                                <span className="font-mono text-xs text-[#C47A2C]">{order.razorpayPaymentId}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
