'use client';

import { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, X, Loader2 } from 'lucide-react';

export function ImageUploader({ value, onChange, label = "Image" }: { value: string; onChange: (url: string) => void; label?: string }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [uploadError, setUploadError] = useState('');

    async function uploadFile(file: File) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setUploadError('Only JPG, PNG and WEBP files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('File must be under 5MB.');
            return;
        }

        setUploading(true);
        setUploadError('');
        try {
            const fd = new FormData();
            fd.append('image', file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections/upload-image`, {
                method: 'POST',
                body: fd,
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Upload failed');
            onChange(data.url);
        } catch (err: any) {
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }

    function handleFiles(files: FileList | null) {
        if (files?.[0]) uploadFile(files[0]);
    }

    return (
        <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                {label}
            </label>

            {value ? (
                /* Preview with replace/remove options */
                <div className="relative group rounded-sm overflow-hidden border border-input">
                    <img src={value} alt="Preview" className="w-full h-36 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="flex items-center gap-1.5 bg-white/90 text-black px-3 py-1.5 rounded text-xs font-bold hover:bg-white transition-colors"
                        >
                            <UploadCloud className="h-3.5 w-3.5" /> Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="flex items-center gap-1.5 bg-red-600/90 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" /> Remove
                        </button>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-600 rounded-full p-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    </div>
                </div>
            ) : (
                /* Drop zone */
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                    className={`border-2 border-dashed rounded-sm p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all select-none
                        ${uploading ? 'opacity-60 cursor-wait' : ''}
                        ${dragging ? 'border-amber-500 bg-amber-500/5' : 'border-muted-foreground/25 hover:border-amber-500/60 hover:bg-white/[0.02]'}`}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-7 w-7 text-amber-500 animate-spin mb-2" />
                            <p className="text-xs text-muted-foreground">Uploading to Cloudinary...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-3 rounded-full bg-muted mb-3">
                                <UploadCloud className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">Drop image here or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max 5MB</p>
                            <p className="text-amber-500 text-xs font-bold mt-3 uppercase tracking-wider">Browse Files</p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => handleFiles(e.target.files)}
            />

            {uploadError && (
                <p className="text-xs text-destructive mt-1.5">{uploadError}</p>
            )}
        </div>
    );
}
