'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Library, Star, X, UploadCloud, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

interface Collection {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    featured: boolean;
    createdAt: string;
}

interface FormState {
    name: string;
    description: string;
    image: string;      // Cloudinary URL stored here after upload
    featured: boolean;
}

const EMPTY_FORM: FormState = { name: '', description: '', image: '', featured: false };

import { ImageUploader } from '@/components/ui/ImageUploader';

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    async function fetchCollections() {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`);
            const data = await res.json();
            if (data.success) setCollections(data.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchCollections(); }, []);

    function openCreate() {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setError('');
        setModalOpen(true);
    }

    function openEdit(col: Collection) {
        setForm({ name: col.name, description: col.description, image: col.image, featured: col.featured });
        setEditingId(col._id);
        setError('');
        setModalOpen(true);
    }

    async function handleSave() {
        if (!form.name.trim() || !form.description.trim()) {
            setError('Name and description are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const url = editingId
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/collections/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/collections`;

            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Something went wrong.');
                return;
            }

            setModalOpen(false);
            fetchCollections();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Permanently delete "${name}"? Products in this collection will lose their collection association.`)) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections/${id}`, { method: 'DELETE' });
            setCollections(prev => prev.filter(c => c._id !== id));
        } catch (e) { console.error(e); }
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
                    <p className="text-muted-foreground mt-1">Manage product collections shown on the storefront.</p>
                </div>
                <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700 gap-2">
                    <Plus className="h-4 w-4" /> New Collection
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-sm border bg-card">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading collections...
                    </div>
                ) : collections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <Library className="h-10 w-10 opacity-30" />
                        <p className="text-sm">No collections yet. Create your first one.</p>
                        <Button onClick={openCreate} className="bg-amber-600 hover:bg-amber-700 mt-2 gap-2">
                            <Plus className="h-4 w-4" /> New Collection
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">IMAGE</TableHead>
                                <TableHead>NAME</TableHead>
                                <TableHead>SLUG</TableHead>
                                <TableHead>DESCRIPTION</TableHead>
                                <TableHead>FEATURED</TableHead>
                                <TableHead className="text-right">ACTIONS</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {collections.map(col => (
                                <TableRow key={col._id}>
                                    <TableCell>
                                        <div className="h-10 w-14 rounded-sm bg-muted overflow-hidden">
                                            {col.image
                                                ? <img src={col.image} alt={col.name} className="object-cover w-full h-full" />
                                                : <ImageIcon className="h-4 w-4 m-auto mt-3 text-muted-foreground/40" />
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{col.name}</TableCell>
                                    <TableCell>
                                        <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                            {col.slug}
                                        </code>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                                        {col.description}
                                    </TableCell>
                                    <TableCell>
                                        {col.featured
                                            ? <Badge variant="active" className="uppercase text-[10px] gap-1"><Star className="h-3 w-3" /> Featured</Badge>
                                            : <Badge variant="draft" className="uppercase text-[10px]">Standard</Badge>
                                        }
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(col)}>
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(col._id, col.name)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => !saving && setModalOpen(false)}
                    />

                    {/* Panel */}
                    <div
                        className="relative z-10 w-full max-w-lg rounded-sm border shadow-2xl overflow-y-auto max-h-[90vh]"
                        style={{ background: '#111', borderColor: '#1f1f1f' }}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: '#1f1f1f' }}>
                            <h2 className="text-lg font-bold">
                                {editingId ? 'Edit Collection' : 'New Collection'}
                            </h2>
                            <button
                                onClick={() => !saving && setModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Fields */}
                        <div className="px-6 py-5 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                                    Collection Name *
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Lunar Glaze"
                                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                {form.name && (
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        Slug: <code className="text-amber-500/80">{form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</code>
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1.5 block">
                                    Description *
                                </label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe this collection..."
                                    className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                />
                            </div>

                            {/* Image uploader */}
                            <ImageUploader
                                value={form.image}
                                onChange={url => setForm(f => ({ ...f, image: url }))}
                                label="Cover Image"
                            />

                            {/* Featured */}
                            <div className="flex items-center gap-3 py-2 border-t" style={{ borderColor: '#1f1f1f' }}>
                                <input
                                    id="featured"
                                    type="checkbox"
                                    checked={form.featured}
                                    onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                                    className="h-4 w-4 accent-amber-600"
                                />
                                <label htmlFor="featured" className="text-sm cursor-pointer select-none">
                                    Mark as <span className="text-amber-500 font-medium">Featured</span>
                                    <span className="text-muted-foreground ml-1 text-xs">(highlighted on homepage)</span>
                                </label>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="mx-6 mb-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
                                {error}
                            </p>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-2 px-6 pb-6">
                            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-amber-600 hover:bg-amber-700 gap-2 min-w-[120px]"
                            >
                                {saving
                                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
                                    : editingId ? 'Save Changes' : 'Create Collection'
                                }
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
