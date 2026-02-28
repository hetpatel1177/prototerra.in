import express from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../lib/email';
import User from '../models/User';



const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, provider: 'credentials' });

        res.status(201).json({ success: true, data: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

// POST /api/auth/login (Validate credentials)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const user = await User.findOne({ email, provider: 'credentials' });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Check if password exists (could be OAuth user trying to login with password)
        if (!user.password) {
            return res.status(400).json({ success: false, error: 'Invalid login method' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Return user data (NextAuth will handle session/jwt)
        res.json({ success: true, data: { id: user._id, name: user.name, email: user.email, image: user.image } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.provider !== 'credentials') {
            // Prevent email enumeration
            return res.json({ success: true, data: "If an account exists, an email was sent." });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set expiry
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const message = `
            <h1>Password Reset Request</h1>
            <p>You have requested to reset your password. Please click the link below to set a new password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link is valid for 10 minutes.</p>
        `;

        try {
            const emailRes = await sendEmail(
                user.email,
                'Password Reset Request',
                message
            );

            if (!emailRes) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                await user.save();
                return res.status(500).json({ success: false, error: 'Email could not be sent. Please try again later.' });
            }

            res.json({ success: true, data: "Email sent" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            return res.status(500).json({ success: false, error: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// POST /api/auth/reset-password
router.put('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        // Hash token to compare with DB
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, error: 'Invalid or expired token' });
        }

        // Set new password
        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, data: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

export default router;
