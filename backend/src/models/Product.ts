import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    collectionId?: mongoose.Types.ObjectId;
    features: string[];
    tags: string[];
    dimensions?: string;
    material?: string;
    sku?: string;
    stockQty?: number;
    inStock: boolean;
}

const ProductSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true },
    collectionId: { type: Schema.Types.ObjectId, ref: 'Collection' },
    features: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    dimensions: { type: String },
    material: { type: String },
    sku: { type: String },
    stockQty: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
