import express from 'express';
import Product from '../models/Product';
import Collection from '../models/Collection';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // Clear existing
        await Collection.deleteMany({});
        await Product.deleteMany({});

        // Collections
        const collections = await Collection.insertMany([
            {
                name: 'Earthware',
                slug: 'earthware',
                description: 'Raw, unrefined textures inspired by the high desert. Handcrafted from reclaimed terracotta.',
                image: '/images/collection-earthware.jpg',
                featured: true
            },
            {
                name: 'Modern Geometry',
                slug: 'modern-geometry',
                description: 'Sharp lines meeting organic clay. Where mathematical precision meets ancient craft.',
                image: '/images/collection-geometry.jpg',
                featured: true
            },
            {
                name: 'Ancestral Heritage',
                slug: 'ancestral-heritage',
                description: 'Techniques passed down through generations, reimagined for contemporary living.',
                image: '/images/collection-heritage.jpg',
                featured: true
            },
            {
                name: 'Volcanic Series',
                slug: 'volcanic-series',
                description: 'Fired at extreme temperatures to capture the raw power of volcanic stone. Deep blacks and charcoal greys.',
                image: '/images/collection-volcanic.jpg',
                featured: true
            },
            {
                name: 'Desert Bloom',
                slug: 'desert-bloom',
                description: 'Warm ochres, dusty pinks and sand tones. Inspired by the flora of arid landscapes.',
                image: '/images/collection-desert-bloom.jpg',
                featured: false
            },
            {
                name: 'Stone & Root',
                slug: 'stone-and-root',
                description: 'A fusion of mineral clay and reclaimed hardwood. Two of Earth\'s oldest materials, united.',
                image: '/images/collection-stone-root.jpg',
                featured: false
            },
            {
                name: 'Lunar Glaze',
                slug: 'lunar-glaze',
                description: 'Iridescent glazes that shift with the light. Pale whites, soft greys and silver undertones.',
                image: '/images/collection-lunar.jpg',
                featured: false
            }
        ]);

        const earthwareId = collections[0]._id;
        const geometryId = collections[1]._id;

        // Products
        await Product.insertMany([
            {
                name: 'Noire Tall Vase',
                description: 'A striking matte black vase with hand-carved textures.',
                price: 185,
                images: ['/images/product-1.jpg'],
                category: 'Vase',
                collectionId: earthwareId,
                features: ['Hand-carved', 'Matte Finish'],
                dimensions: '30cm x 12cm',
                inStock: true
            },
            {
                name: 'Desert Pebble Bowl',
                description: 'Smooth, stone-like finish perfect for centerpieces.',
                price: 64,
                images: ['/images/product-2.jpg'],
                category: 'Bowl',
                collectionId: earthwareId,
                features: ['Food Safe', 'Dishwasher Safe'],
                inStock: true
            },
            {
                name: 'Geometric Planter',
                description: 'Angular design for modern spaces.',
                price: 95,
                images: ['/images/product-3.jpg'],
                category: 'Planter',
                collectionId: geometryId,
                features: ['Drainage Hole', 'Frost Resistant'],
                inStock: true
            }
        ]);

        res.json({ success: true, message: 'Database seeded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Seeding failed' });
    }
});

export default router;
