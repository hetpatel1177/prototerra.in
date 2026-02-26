import express from 'express';
import Subscriber from '../models/Subscriber';
import { sendEmail } from '../lib/email';

const router = express.Router();

router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required.' });
        }

        // Check if already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, error: 'You are already subscribed to the journal.' });
        }

        // Create new subscriber
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        // Send welcome email
        const subject = 'Welcome to the ProtoTerra Journal';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; text-align: center;">
                <h1 style="color: #c47a2c;">Welcome to the ProtoTerra Journal</h1>
                <p>Thank you for subscribing to our mailing list.</p>
                <p>You will now receive exclusive updates on our latest collections, behind-the-scenes processes, and upcoming product launches directly to your inbox.</p>
                <br/>
                <p>Best regards,</p>
                <p><strong>The ProtoTerra Team</strong></p>
            </div>
        `;

        await sendEmail(email, subject, html);

        return res.status(200).json({ success: true, message: 'Successfully subscribed to the journal.' });
    } catch (error: any) {
        console.error('Newsletter subscription error:', error);
        return res.status(500).json({ success: false, error: 'Internal server error while subscribing.' });
    }
});

export default router;
