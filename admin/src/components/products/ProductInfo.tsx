'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

export function ProductInfo({ initialData }: { initialData?: any }) {
    const [collections, setCollections] = useState<{ _id: string; name: string }[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`)
            .then(r => r.json())
            .then(d => { if (d.success) setCollections(d.data); })
            .catch(() => { });
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-amber-500" />
                    Product Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">Product Title *</label>
                    <Input
                        id="name"
                        name="name"
                        required
                        defaultValue={initialData?.name}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={4}
                        placeholder="Tell your customers about this product..."
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        defaultValue={initialData?.description}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="category">Category *</label>
                        <select
                            id="category"
                            name="category"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            defaultValue={initialData?.category || ""}
                        >
                            <option value="">Select a category</option>
                            <option value="Home Decor">Home Decor</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Art">Art</option>
                            <option value="Furniture">Furniture</option>
                            <option value="Lighting">Lighting</option>
                            <option value="Textiles">Textiles</option>
                            <option value="Ceramics">Ceramics</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="collectionId">Collection</label>
                        <select
                            id="collectionId"
                            name="collectionId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            defaultValue={initialData?.collectionId || ""}
                        >
                            <option value="">No collection</option>
                            {collections.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="material">Material</label>
                        <Input id="material" name="material" placeholder="e.g. Terracotta, Oak" defaultValue={initialData?.material} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="dimensions">Dimensions</label>
                        <Input id="dimensions" name="dimensions" placeholder="e.g. 12 × 8 × 6 cm" defaultValue={initialData?.dimensions} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
