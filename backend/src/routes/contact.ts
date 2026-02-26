
import express from 'express';
import Contact from '../models/Contact';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configure the email transporter
// IMPORTANT: These credentials should be stored in environment variables (e.g. .env)
import { sendEmail } from '../lib/email';

// GET /api/contact - Fetch all contact submissions for the Admin Panel
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (error: any) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// POST /api/contact - Submit a new inquiry
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, orderId, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
        }

        // 1. Save to Database
        const newContact = await Contact.create({
            name,
            email,
            subject,
            orderId,
            message,
        });

        // 2. Send Email Notification to Admin
        const html = `
            <h3>New message received from your website</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            ${orderId ? `<p><strong>Order ID:</strong> ${orderId}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <br/>
            <hr/>
            <p style="font-size: 12px; color: gray;">This email was sent automatically from your ProtoTerra contact form.</p>
        `;

        // Send to Admin, reply-to user
        await sendEmail('admin@prototerra.in', `New Contact Form Submission: ${subject}`, html, email);

        // 3. Send Auto-Reply to User
        const autoReplyHtml = `
            <div style="font-family: sans-serif; color: #333;">
                <h3 style="color: #C47A2C;">We received your message</h3>
                <p>Hi ${name},</p>
                <p>Thank you for contacting ProtoTerra. We have received your inquiry regarding "<strong>${subject}</strong>".</p>
                <p>Our team will review your message and get back to you shortly.</p>
                <br/>
                <p>Best regards,</p>
                <p><strong>The ProtoTerra Team</strong></p>
            </div>
        `;
        await sendEmail(email, `We received your inquiry: ${subject}`, autoReplyHtml);

        res.status(201).json({ success: true, data: newContact });
    } catch (error: any) {
        console.error('Contact submission error:', error);
        res.status(500).json({ success: false, error: 'Failed to submit inquiry.' });
    }
});

// PATCH /api/contact/:id - Update status of a message
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'in-progress', 'resolved'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const updatedContact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { returnDocument: 'after' }
        );

        if (!updatedContact) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        res.json({ success: true, data: updatedContact });
    } catch (error: any) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update status' });
    }
});

export default router;
