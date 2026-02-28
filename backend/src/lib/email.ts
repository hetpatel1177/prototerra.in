
import nodemailer from 'nodemailer';

// Create transporter using SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.EMAIL_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string, replyTo?: string, bcc?: string) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ Email credentials not found in environment variables. Email will not be sent.');
        return;
    }

    try {
        const mailOptions = {
            from: `"ProtoTerra" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            replyTo: replyTo || process.env.EMAIL_USER,
            bcc,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to prevent blocking the main request flow
    }
};
