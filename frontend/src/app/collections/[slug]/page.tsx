import { Metadata } from 'next';
import CollectionClient from './CollectionClient';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

async function getCollectionData(slug: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Fetch collection details
    const colRes = await fetch(`${apiUrl}/api/collections/${slug}`, { next: { revalidate: 3600 } });
    if (!colRes.ok) return null;
    const colData = await colRes.json();

    if (!colData.success || !colData.data) return null;

    const collection = colData.data;

    // Fetch products in this collection
    const prodRes = await fetch(`${apiUrl}/api/products?collectionId=${collection._id}`, { next: { revalidate: 3600 } });
    const prodData = await prodRes.json();
    const products = prodData.success ? prodData.data : [];

    return { collection, products };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCollectionData(slug);

    if (!data) return { title: 'Collection Not Found' };

    return {
        title: data.collection.name,
        description: data.collection.description.substring(0, 160),
        openGraph: {
            title: data.collection.name,
            description: data.collection.description.substring(0, 160),
            images: data.collection.image ? [{ url: data.collection.image }] : [],
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/collections/${data.collection.slug || data.collection._id}`,
        }
    };
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/collections`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            return data.data.map((col: any) => ({
                slug: col.slug || col._id,
            }));
        }
    } catch (e) {
        console.error("Failed to fetch collections for static params", e);
    }
    return [];
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const data = await getCollectionData(slug);

    if (!data) {
        notFound();
    }

    return <CollectionClient collection={data.collection} products={data.products} />;
}
