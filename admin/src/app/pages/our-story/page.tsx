'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, ArrowLeft, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ImageUploader } from '@/components/ui/ImageUploader';

export default function EditOurStoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState<any>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/our-story`)
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data) {
                    setContent(data.data);
                }
            })
            .catch(err => toast.error('Failed to load content'))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (section: string, field: string, value: string) => {
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleArrayChange = (section: string, arrayName: string, index: number, field: string, value: string) => {
        const newArray = [...content[section][arrayName]];
        newArray[index] = { ...newArray[index], [field]: value };
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: newArray
            }
        }));
    };

    const addItem = (section: string, arrayName: string, template: any) => {
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: [...prev[section][arrayName], template]
            }
        }));
    };

    const removeItem = (section: string, arrayName: string, index: number) => {
        setContent((prev: any) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [arrayName]: prev[section][arrayName].filter((_: any, i: number) => i !== index)
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/our-story`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Page updated successfully');
            } else {
                toast.error(data.error || 'Update failed');
            }
        } catch (err) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-zinc-500">Loading content...</div>;
    if (!content) return <div className="p-8 text-center text-red-500">Content not found.</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-20 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/pages"><ArrowLeft className="w-4 h-4" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white/90">Edit Our Story</h1>
                        <p className="text-zinc-400 text-sm">Update text, images, and lists for the story page.</p>
                    </div>
                </div>
                <Button type="submit" disabled={saving} className="bg-amber-600 hover:bg-amber-700 text-white">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="bg-zinc-900 border-zinc-800">
                    <TabsTrigger value="hero">Hero Section</TabsTrigger>
                    <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
                    <TabsTrigger value="process">The Process</TabsTrigger>
                </TabsList>

                {/* Hero Tab */}
                <TabsContent value="hero" className="mt-6 space-y-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle>Hero Configuration</CardTitle>
                            <CardDescription>Top section of the page.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Subtitle (Small Top Text)</label>
                                <Input value={content.hero.subtitle} onChange={e => handleChange('hero', 'subtitle', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title (Main Heading)</label>
                                <textarea
                                    className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    value={content.hero.title}
                                    onChange={e => handleChange('hero', 'title', e.target.value)}
                                />
                                <p className="text-xs text-zinc-500">Use \n for line breaks.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    value={content.hero.description}
                                    onChange={e => handleChange('hero', 'description', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <ImageUploader label="Background Image" value={content.hero.image} onChange={url => handleChange('hero', 'image', url)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Philosophy Tab */}
                <TabsContent value="philosophy" className="mt-6 space-y-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle>Philosophy Section</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Heading</label>
                                <Input value={content.philosophy.heading} onChange={e => handleChange('philosophy', 'heading', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paragraph 1</label>
                                <textarea
                                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    value={content.philosophy.text1}
                                    onChange={e => handleChange('philosophy', 'text1', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paragraph 2</label>
                                <textarea
                                    className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    value={content.philosophy.text2}
                                    onChange={e => handleChange('philosophy', 'text2', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <ImageUploader label="Philosophy Image" value={content.philosophy.image} onChange={url => handleChange('philosophy', 'image', url)} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Process Tab */}
                <TabsContent value="process" className="mt-6 space-y-4">
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader>
                            <CardTitle>Process Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Heading</label>
                                    <Input value={content.process.heading} onChange={e => handleChange('process', 'heading', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description</label>
                                    <Input value={content.process.description} onChange={e => handleChange('process', 'description', e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Process Steps</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addItem('process', 'steps', { title: 'New Step', desc: '', img: '' })}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Step
                            </Button>
                        </div>
                        {content.process.steps.map((step: any, i: number) => (
                            <Card key={i} className="bg-zinc-900 border-zinc-800 relative group">
                                <button
                                    type="button"
                                    onClick={() => removeItem('process', 'steps', i)}
                                    className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <CardContent className="pt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium uppercase text-zinc-500">Step Title</label>
                                        <Input value={step.title} onChange={e => handleArrayChange('process', 'steps', i, 'title', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <ImageUploader label="Step Image" value={step.img || step.image || ''} onChange={url => handleArrayChange('process', 'steps', i, 'img', url)} />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-xs font-medium uppercase text-zinc-500">Description</label>
                                        <textarea
                                            className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            value={step.desc || step.description}
                                            onChange={e => handleArrayChange('process', 'steps', i, 'desc', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

            </Tabs>
        </form>
    );
}
