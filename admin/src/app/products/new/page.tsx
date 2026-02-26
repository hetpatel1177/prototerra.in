'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductMedia } from '@/components/products/ProductMedia';
import { PricingInventory } from '@/components/products/PricingInventory';
import { StatusTags } from '@/components/products/StatusTags';

export default function AddProductPage() {
    const router = useRouter();
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (images.length === 0) {
            setError('Please upload at least one product image.');
            return;
        }

        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const data = new FormData(form);

        // Append image files (the backend expects field name "images")
        images.forEach((file) => data.append('images', file));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                method: 'POST',
                body: data,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to create product');
            setSuccess(true);
            setTimeout(() => router.push('/products'), 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Dashboard</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/products" className="hover:text-foreground">Products</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Add New Product</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
                    <p className="text-muted-foreground">Fill in the details below to create a new entry in your store's catalog.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/products">Cancel</Link>
                    </Button>
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={loading || success}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {success && <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {success ? 'Saved!' : loading ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Body */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="col-span-2 space-y-6">
                    <ProductInfo />
                    <PricingInventory />
                </div>
                <div className="space-y-6">
                    <ProductMedia onImagesChange={setImages} />
                    <StatusTags />

                    <Card className="bg-amber-950/20 border-amber-900/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                                    <span className="font-bold text-lg">?</span>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-amber-500">Need help?</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Refer to our <span className="text-amber-500 cursor-pointer hover:underline">documentation</span> for inventory management best practices.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2 border-t pt-6">
                <Button type="button" variant="outline" onClick={() => router.push('/products')}>Discard</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={loading || success}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {success ? 'Redirecting...' : loading ? 'Publishing...' : 'Publish Product'}
                </Button>
            </div>
        </form>
    );
}
