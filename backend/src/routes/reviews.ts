import express from 'express';
import Review from '../models/Review';

const router = express.Router();

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { productId, userEmail, userName, rating, comment } = req.body;

        if (!productId || !userName || !rating || !comment) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields' });
        }

        const review = await Review.create({
            productId,
            userEmail,
            userName,
            rating: Number(rating),
            comment,
        });

        res.status(201).json({ success: true, data: review });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, error: 'Review not found' });

        if (review.userEmail !== email) {
            return res.status(403).json({ success: false, error: 'You can only delete your own reviews' });
        }

        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted' });
    } catch {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
