'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';

interface Product {
    _id: string;
    name: string;
    price: number;
    images: string[];
}

export function TopProduct() {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/analytics`)
            .then(r => r.json())
            .then(d => {
                if (d.success && d.data?.topProducts?.length > 0) {
                    setProduct(d.data.topProducts[0]);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Top Product</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </div>
                ) : !product ? (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm mb-4">
                        No products yet
                    </div>
                ) : (
                    <>
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted mb-4">
                            {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                            ) : (
                                <div className="absolute inset-0 bg-stone-800 flex items-center justify-center">
                                    <span className="text-stone-500">No Image</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                                <h4 className="font-semibold text-white truncate">{product.name}</h4>
                                <p className="text-yellow-500 font-bold">{formatPrice(product.price)}</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
