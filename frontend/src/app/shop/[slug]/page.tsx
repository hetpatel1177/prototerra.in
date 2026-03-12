import { Metadata } from 'next';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate every hour

async function getProduct(slug: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${slug}`, {
        next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) return { title: 'Product Not Found' };

    return {
        title: product.name,
        description: product.description.substring(0, 160),
        openGraph: {
            title: product.name,
            description: product.description.substring(0, 160),
            images: product.images?.[0] ? [{ url: product.images[0] }] : [],
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/shop/${product.slug || product._id}`,
        }
    };
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            return data.data.map((product: any) => ({
                slug: product.slug || product._id,
            }));
        }
    } catch (e) {
        console.error("Failed to fetch products for static params", e);
    }
    return [];
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "image": product.images,
                        "description": product.description,
                        "sku": product.sku || product._id,
                        "brand": {
                            "@type": "Brand",
                            "name": "ProtoTerra"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": `${process.env.NEXT_PUBLIC_SITE_URL || ''}/shop/${product.slug}`,
                            "priceCurrency": "INR",
                            "price": product.price,
                            "itemCondition": "https://schema.org/NewCondition",
                            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
                        }
                    })
                }}
            />
            <ProductClient product={product} />
        </>
    );
}
