import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    productId: mongoose.Types.ObjectId;
    userEmail?: string;
    userName: string;
    rating: number; // 1 to 5
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    userEmail: { type: String },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
