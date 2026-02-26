'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react';

interface ProductMediaProps {
    initialData?: any;
    onImagesChange?: (files: File[]) => void;
    onExistingImagesChange?: (urls: string[]) => void;
}

export function ProductMedia({ initialData, onImagesChange, onExistingImagesChange }: ProductMediaProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [existingPreviews, setExistingPreviews] = useState<string[]>(initialData?.images || []);
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
    const [dragging, setDragging] = useState(false);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const valid = Array.from(incoming).filter(
            (f) => f.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
        );
        const next = [
            ...previews,
            ...valid.map((file) => ({ file, url: URL.createObjectURL(file) })),
        ].slice(0, 5); // max 5 images
        setPreviews(next);
        onImagesChange?.(next.map((p) => p.file));
    };

    const remove = (index: number) => {
        URL.revokeObjectURL(previews[index].url);
        const next = previews.filter((_, i) => i !== index);
        setPreviews(next);
        onImagesChange?.(next.map((p) => p.file));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-amber-500" />
                    Product Media
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {previews.length + existingPreviews.length}/5 images
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Drop zone */}
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
                        ${dragging ? 'border-amber-500 bg-amber-500/5' : 'border-muted-foreground/25 hover:bg-accent/50'}`}
                >
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <UploadCloud className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold">Drop images here or click to browse</h4>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max 5MB · Up to 5 images</p>
                    <p className="text-amber-500 text-xs font-bold mt-4 uppercase tracking-wider">Browse Files</p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                />

                {/* Preview grid */}
                {(previews.length > 0 || existingPreviews.length > 0) && (
                    <div className="grid grid-cols-3 gap-3">
                        {existingPreviews.map((url, i) => (
                            <div key={url} className="relative aspect-square rounded-md overflow-hidden border group">
                                <Image
                                    src={url}
                                    alt={`Existing Product image ${i + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                {i === 0 && (
                                    <span className="absolute bottom-1 left-1 text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded font-semibold">
                                        Cover
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const next = existingPreviews.filter((_, idx) => idx !== i);
                                        setExistingPreviews(next);
                                        onExistingImagesChange?.(next);
                                    }}
                                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        {previews.map((p, i) => (
                            <div key={p.url} className="relative aspect-square rounded-md overflow-hidden border group">
                                <Image
                                    src={p.url}
                                    alt={`Product image ${i + existingPreviews.length + 1}`}
                                    fill
                                    className="object-cover"
                                />
                                {i === 0 && existingPreviews.length === 0 && (
                                    <span className="absolute bottom-1 left-1 text-[10px] bg-amber-600 text-white px-1.5 py-0.5 rounded font-semibold">
                                        Cover
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); remove(i); }}
                                    className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        {/* Empty slots */}
                        {Array.from({ length: Math.max(0, 3 - (previews.length + existingPreviews.length)) }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                onClick={() => inputRef.current?.click()}
                                className="aspect-square bg-muted rounded-md border flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                            >
                                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        ))}
                    </div>
                )}

                {(previews.length + existingPreviews.length) === 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="aspect-square bg-muted rounded-md border flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
