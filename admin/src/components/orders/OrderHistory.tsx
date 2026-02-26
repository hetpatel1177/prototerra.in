import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Truck, Package, Clock } from 'lucide-react';

interface Order {
    status: string;
    createdAt: string;
}

const STATUS_STEPS = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'Package Shipped', icon: Truck },
    { key: 'delivered', label: 'Order Delivered', icon: Check },
];

export function OrderHistory({ order }: { order: Order }) {
    const currentIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
    const completedIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    Order History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative pl-4 border-l-2 border-muted/30 space-y-8 ml-2">
                    {STATUS_STEPS.map((step, index) => {
                        const done = index <= completedIndex;
                        const Icon = step.icon;
                        return (
                            <div key={step.key} className="relative pl-6">
                                <div className={`absolute -left-[27px] top-0 flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-amber-600' : 'bg-muted'} text-white ring-4 ring-background`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-semibold ${done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                                    {index === 0 && (
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </span>
                                    )}
                                    {index === completedIndex && index > 0 && (
                                        <span className="text-sm text-muted-foreground">Current status</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
