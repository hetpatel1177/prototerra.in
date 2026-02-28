import { MetadataRoute } from 'next';

const STATIC_ROUTES = [
    '',
    '/shop',
    '/collections',
    '/our-story',
    '/sustainability',
    '/contact',
    '/login',
    '/signup',
];

export const revalidate = 86400; // Revalidate sitemap once a day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://prototerra.in';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.prototerra.in';

    // Static pages
    const sitemapEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' || route === '/shop' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Products
    try {
        const res = await fetch(`${apiUrl}/api/products`, { next: { revalidate: 3600 } });
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
            data.data.forEach((product: any) => {
                const date = product.updatedAt ? new Date(product.updatedAt) : new Date();
                sitemapEntries.push({
                    url: `${baseUrl}/shop/${product.slug || product._id}`,
                    lastModified: date.getTime() ? date : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.7,
                });
            });
        }
    } catch (e) {
        console.warn("Sitemap: Products fetch failed", e);
    }

    // Dynamic Collections
    try {
        const cRes = await fetch(`${apiUrl}/api/collections`, { next: { revalidate: 3600 } });
        const cData = await cRes.json();
        if (cData?.success && Array.isArray(cData.data)) {
            cData.data.forEach((collection: any) => {
                const date = collection.updatedAt ? new Date(collection.updatedAt) : new Date();
                sitemapEntries.push({
                    url: `${baseUrl}/collections/${collection.slug || collection._id}`,
                    lastModified: date.getTime() ? date : new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8,
                });
            });
        }
    } catch (e) {
        console.warn("Sitemap: Collections fetch failed", e);
    }

    return sitemapEntries;
}
