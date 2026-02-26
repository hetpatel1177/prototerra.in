'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductInfo } from '@/components/products/ProductInfo';
import { ProductMedia } from '@/components/products/ProductMedia';
import { PricingInventory } from '@/components/products/PricingInventory';
import { StatusTags } from '@/components/products/StatusTags';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params?.id as string;

    const [images, setImages] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        if (!productId) return;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProduct(data.data);
                    setExistingImages(data.data.images || []);
                } else {
                    setError('Failed to load product details.');
                }
            })
            .catch(() => setError('Failed to load product details.'))
            .finally(() => setInitialLoading(false));
    }, [productId]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Backend handles images uniquely: if no new images are provided, it keeps the old ones. 
        // If there are new files, it deletes all old ones from Cloudinary and uses ONLY the new ones.
        // So we just have to pass the images state.
        // The UI handles this limitation by letting user upload a fresh batch of 5 if they want to override.

        setLoading(true);
        setError('');

        const form = e.currentTarget;
        const data = new FormData(form);

        // Append image files
        images.forEach((file) => data.append('images', file));
        data.append('existingImages', JSON.stringify(existingImages));

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
                method: 'PUT',
                body: data,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to update product');
            setSuccess(true);
            setTimeout(() => router.push('/products'), 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (initialLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <p>Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product && !initialLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-center text-muted-foreground">
                    <p className="mb-4">Product not found.</p>
                    <Button variant="outline" asChild>
                        <Link href="/products">Go back</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-12">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Dashboard</Link>
                <ChevronRight className="h-4 w-4" />
                <Link href="/products" className="hover:text-foreground">Products</Link>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Edit Product</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                    <p className="text-muted-foreground">Update the details for this product.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/products">Cancel</Link>
                    </Button>
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={loading || success}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {success && <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {success ? 'Saved!' : loading ? 'Saving...' : 'Save Changes'}
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
                    <ProductInfo initialData={product} />
                    <PricingInventory initialData={product} />
                </div>
                <div className="space-y-6">
                    <ProductMedia
                        initialData={product}
                        onImagesChange={setImages}
                        onExistingImagesChange={setExistingImages}
                    // Note: to fully support individual image deletion, backend changes are needed. 
                    // For now we just show existing images and warn if they upload new ones.
                    />

                    <StatusTags initialData={product} />

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
                <Button type="button" variant="outline" onClick={() => router.push('/products')}>Discard Changes</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700" disabled={loading || success}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {success ? 'Redirecting...' : loading ? 'Saving...' : 'Save Product'}
                </Button>
            </div>
        </form>
    );
}
