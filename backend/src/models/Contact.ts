
import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    subject: 'General Inquiry' | 'Return' | 'Product Fault' | 'Customization';
    orderId?: string;
    message: string;
    status: 'pending' | 'in-progress' | 'resolved';
    createdAt: Date;
}

const ContactSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: {
        type: String,
        required: true,
        enum: ['General Inquiry', 'Return', 'Product Fault', 'Customization'],
        default: 'General Inquiry'
    },
    orderId: { type: String, required: false },
    message: { type: String, required: true },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'in-progress', 'resolved']
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IContact>('Contact', ContactSchema);
