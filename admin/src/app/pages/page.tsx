'use client';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ExternalLink, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PagesIndex() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white/90">Pages</h1>
                    <p className="text-zinc-400">Manage your static page content.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center text-white/90">
                            Our Story
                            <Link href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/our-story`} target="_blank">
                                <ExternalLink className="w-4 h-4 text-zinc-500 hover:text-white" />
                            </Link>
                        </CardTitle>
                        <CardDescription>Company history, philosophy, and team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/pages/our-story">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Content
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
