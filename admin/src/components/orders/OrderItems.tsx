import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
interface OrderItem {
    productId: { name: string; images: string[] } | null;
    quantity: number;
    price: number;
}

interface Order {
    items: OrderItem[];
}

export function OrderItems({ order }: { order: Order }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-500" />
                    Items ({order.items.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-4 border-b bg-muted/50 p-4 text-xs font-medium text-muted-foreground uppercase">
                        <div className="col-span-6">Product</div>
                        <div className="col-span-2">Quantity</div>
                        <div className="col-span-2 text-right">Price</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>
                    <div className="divide-y">
                        {order.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center">
                                <div className="col-span-6 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                                        {item.productId?.images?.[0] && (
                                            <img src={item.productId.images[0]} alt={item.productId.name} className="object-cover w-full h-full" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{item.productId?.name ?? 'Product'}</p>
                                    </div>
                                </div>
                                <div className="col-span-2 font-medium">{item.quantity}</div>
                                <div className="col-span-2 text-right text-muted-foreground">{formatPrice(item.price)}</div>
                                <div className="col-span-2 text-right font-bold">{formatPrice(item.price * item.quantity)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
