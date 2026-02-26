
import express from 'express';
import PageContent from '../models/PageContent';
import { upload } from '../lib/cloudinary';

const router = express.Router();

// GET content by slug
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        let content = await PageContent.findOne({ slug });
        if (!content) {
            return res.status(404).json({ success: false, error: 'Content not found' });
        }
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// Update content by slug
router.put('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        let content = await PageContent.findOne({ slug });

        if (!content) {
            // Create if not exists
            content = new PageContent({ slug, ...req.body });
        } else {
            // Update fields
            Object.assign(content, req.body);
        }

        await content.save();
        res.json({ success: true, data: content });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
