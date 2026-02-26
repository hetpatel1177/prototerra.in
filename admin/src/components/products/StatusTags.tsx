'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, X } from 'lucide-react';

export function StatusTags({ initialData }: { initialData?: any }) {
    const [inStock, setInStock] = useState<boolean>(initialData?.inStock ?? true);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const inputRef = useRef<HTMLInputElement>(null);

    function addTag(raw: string) {
        const tag = raw.trim().toUpperCase();
        if (tag && !tags.includes(tag)) {
            setTags(prev => [...prev, tag]);
        }
        if (inputRef.current) inputRef.current.value = '';
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(e.currentTarget.value);
        } else if (e.key === ',') {
            e.preventDefault();
            addTag(e.currentTarget.value);
        }
    }

    function removeTag(tag: string) {
        setTags(prev => prev.filter(t => t !== tag));
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-amber-500" />
                    Status &amp; Tags
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* In-stock toggle */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <label className="text-sm font-medium">In Stock</label>
                        <p className="text-xs text-muted-foreground">Is this product available to purchase?</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${inStock ? 'text-amber-500' : 'text-muted-foreground'}`}>
                            {inStock ? 'IN STOCK' : 'DRAFT'}
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={inStock}
                            onClick={() => setInStock(v => !v)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-background ${inStock ? 'bg-amber-600' : 'bg-muted'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${inStock ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Hidden input so FormData picks up the inStock value */}
                <input type="hidden" name="inStock" value={inStock ? 'true' : 'false'} />

                {/* Tags */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a tag and press Enter or comma..."
                        onKeyDown={handleKeyDown}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {tags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="border-amber-500/20 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 gap-1 pr-1"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-0.5 rounded-full hover:bg-amber-500/20 p-0.5"
                                    >
                                        <X className="h-2.5 w-2.5" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                    {/* Hidden input to pass tags as JSON to FormData */}
                    <input type="hidden" name="tags" value={JSON.stringify(tags)} />
                </div>

            </CardContent>
        </Card>
    );
}
