import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
    name: string;
    slug: string;
    description: string;
    image: string;
    featured: boolean;
}

const CollectionSchema: Schema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<ICollection>('Collection', CollectionSchema);
