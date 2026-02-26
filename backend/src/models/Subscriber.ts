import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscriber extends Document {
    email: string;
    createdAt: Date;
}

const SubscriberSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
