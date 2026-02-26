import express from 'express';
import Collection from '../models/Collection';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

const router = express.Router();

// Dedicated Cloudinary storage for collection cover images
const collectionStorage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder: 'prototerra/collections',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1600, height: 900, crop: 'limit', quality: 'auto' }],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    }),
});

const collectionUpload = multer({
    storage: collectionStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
});

// Helper: auto-generate slug from name
function slugify(name: string) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// GET /api/collections
router.get('/', async (_req, res) => {
    try {
        const collections = await Collection.find({}).sort({ createdAt: -1 });
        res.json({ success: true, data: collections });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST /api/collections/upload-image — upload a single cover image to Cloudinary
// Must be defined BEFORE /:slug to avoid route conflicts
router.post('/upload-image', collectionUpload.single('image'), async (req, res) => {
    try {
        const file = req.file as any;
        if (!file) return res.status(400).json({ success: false, error: 'No file provided' });
        res.json({ success: true, url: file.path });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/collections/:slug  (by slug OR id)
router.get('/:slug', async (req, res) => {
    try {
        const collection = await Collection.findOne({ slug: req.params.slug });
        if (!collection) return res.status(404).json({ success: false, error: 'Collection not found' });
        res.json({ success: true, data: collection });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST /api/collections — create new collection
router.post('/', async (req, res) => {
    try {
        const { name, description, image, featured } = req.body;
        if (!name || !description) {
            return res.status(400).json({ success: false, error: 'name and description are required' });
        }

        const slug = slugify(name);

        // Ensure slug is unique
        const existing = await Collection.findOne({ slug });
        if (existing) {
            return res.status(409).json({ success: false, error: `A collection with slug "${slug}" already exists` });
        }

        const collection = await Collection.create({
            name: name.trim(),
            slug,
            description: description.trim(),
            image: image?.trim() || '',
            featured: featured === true || featured === 'true',
        });

        res.status(201).json({ success: true, data: collection });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// PUT /api/collections/:id — update collection by Mongo _id
router.put('/:id', async (req, res) => {
    try {
        const { name, description, image, featured } = req.body;
        const updateData: Record<string, any> = {};

        if (name) {
            updateData.name = name.trim();
            updateData.slug = slugify(name);
        }
        if (description !== undefined) updateData.description = description.trim();
        if (image !== undefined) updateData.image = image.trim();
        if (featured !== undefined) updateData.featured = featured === true || featured === 'true';

        const updated = await Collection.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updated) return res.status(404).json({ success: false, error: 'Collection not found' });
        res.json({ success: true, data: updated });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /api/collections/:id
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Collection.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Collection not found' });
        res.json({ success: true, message: 'Collection deleted' });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;

