import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.prototerra.in';
        // We fetch the dynamic data specifically to set open graph headers without altering client structure
        const res = await fetch(`${apiUrl}/api/products/${params.slug}`);
        if (!res.ok) return { title: 'Product | ProtoTerra' };

        const data = await res.json();
        const product = data.data;

        if (!product) return { title: 'Product Not Found | ProtoTerra' };

        const defaultUrl = 'https://prototerra.in';

        return {
            title: `${product.name} | ProtoTerra`,
            description: product.description?.substring(0, 160) || `Buy ${product.name} at ProtoTerra`,
            openGraph: {
                title: product.name,
                description: product.description?.substring(0, 160),
                url: `${defaultUrl}/shop/${product.slug || product._id}`,
                images: product.images && product.images.length > 0
                    ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }]
                    : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description: product.description?.substring(0, 160),
                images: product.images && product.images.length > 0 ? [product.images[0]] : [],
            }
        };
    } catch (e) {
        return { title: 'Product | ProtoTerra' };
    }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
