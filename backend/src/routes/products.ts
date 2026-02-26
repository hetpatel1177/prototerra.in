import express from 'express';
import Product from '../models/Product';
import { upload, cloudinary } from '../lib/cloudinary';

const router = express.Router();

// GET /api/products  — optional ?collectionId=...
router.get('/', async (req, res) => {
    try {
        const { collectionId } = req.query;
        const query = collectionId ? { collectionId } : {};
        const products = await Product.find(query).sort({ createdAt: -1 });
        res.json({ success: true, data: products });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
        res.json({ success: true, data: product });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST /api/products  — multipart/form-data with up to 5 images
router.post('/', upload.array('images', 5), async (req, res) => {
    try {
        const files = req.files as Express.Multer.File[];

        // Validate required fields early so we return JSON, not an HTML 500
        if (!req.body.name || !req.body.description || !req.body.price || !req.body.category) {
            return res.status(400).json({ success: false, error: 'name, description, price and category are required.' });
        }

        const imageUrls: string[] = files ? files.map((f: any) => f.path) : [];

        // Parse JSON fields sent from hidden inputs
        let tags: string[] = [];
        try { tags = req.body.tags ? JSON.parse(req.body.tags) : []; } catch { tags = []; }

        let features: string[] = [];
        try { features = req.body.features ? JSON.parse(req.body.features) : []; } catch { features = []; }

        const product = await Product.create({
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            collectionId: req.body.collectionId || undefined,
            material: req.body.material || undefined,
            dimensions: req.body.dimensions || undefined,
            sku: req.body.sku || undefined,
            stockQty: req.body.stockQty ? Number(req.body.stockQty) : 0,
            inStock: req.body.inStock !== 'false',
            features,
            tags,
            images: imageUrls,
        });

        res.status(201).json({ success: true, data: product });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT /api/products/:id  — update product, optionally replace images
router.put('/:id', upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        const files = req.files as Express.Multer.File[];

        let existingImages = product.images;
        if (req.body.existingImages) {
            try {
                existingImages = JSON.parse(req.body.existingImages);
            } catch {
                existingImages = product.images;
            }
        }

        // Delete old images from Cloudinary that are no longer in existingImages
        const imagesToDelete = product.images.filter((url: string) => !existingImages.includes(url));
        for (const url of imagesToDelete) {
            try {
                const publicId = url.split('/').slice(-2).join('/').split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (e) {
                console.error("Failed to delete from Cloudinary", url, e);
            }
        }

        let imageUrls = existingImages;
        if (files && files.length > 0) {
            imageUrls = [...imageUrls, ...files.map((f: any) => f.path)].slice(0, 5);
        }

        const updateData = { ...req.body };
        if (updateData.collectionId === "") {
            updateData.collectionId = null;
        }

        if (req.body.tags) {
            try {
                updateData.tags = JSON.parse(req.body.tags);
            } catch {
                updateData.tags = product.tags;
            }
        }

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...updateData,
                features: req.body.features ? JSON.parse(req.body.features) : product.features,
                price: req.body.price ? Number(req.body.price) : product.price,
                inStock: req.body.inStock !== undefined ? req.body.inStock !== 'false' : product.inStock,
                images: imageUrls,
            },
            { returnDocument: 'after', runValidators: true }
        );

        res.json({ success: true, data: updated });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /api/products/:id  — also removes images from Cloudinary
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

        // Remove images from Cloudinary
        for (const url of product.images) {
            const publicId = url.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await product.deleteOne();
        res.json({ success: true, message: 'Product deleted' });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
