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
    // Use the env var during build if available, else fallback to canonical API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.prototerra.in';

    const sitemapEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' || route === '/shop' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));

    try {
        // Attempt to fetch dynamic products
        const res = await fetch(`${apiUrl}/api/products`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && Array.isArray(data.data)) {
                data.data.forEach((product: any) => {
                    sitemapEntries.push({
                        // Defaulting to _id, change to slug if available
                        url: `${baseUrl}/shop/${product._id}`,
                        lastModified: new Date(product.updatedAt || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    });
                });
            }
        }
    } catch (error) {
        console.warn("Could not fetch products for sitemap:", error);
    }

    try {
        // Attempt to fetch dynamic collections
        const cRes = await fetch(`${apiUrl}/api/collections`);
        if (cRes.ok) {
            const cData = await cRes.json();
            if (cData.success && Array.isArray(cData.data)) {
                cData.data.forEach((collection: any) => {
                    sitemapEntries.push({
                        url: `${baseUrl}/collections/${collection.slug || collection._id}`,
                        lastModified: new Date(collection.updatedAt || new Date()),
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    });
                });
            }
        }
    } catch (error) {
        console.warn("Could not fetch collections for sitemap:", error);
    }

    return sitemapEntries;
}
