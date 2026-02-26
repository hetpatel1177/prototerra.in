import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    orderNumber: string;
    customer: {
        email: string;
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zip: string;
    };
    items: IOrderItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipped';
    shippingMethod: string;
    paymentMode: 'RAZORPAY' | 'COD';
}

const OrderSchema: Schema = new Schema({
    orderNumber: { type: String, required: true, unique: true },
    customer: {
        email: { type: String, required: true },
        phone: { type: String }, // Optional or required? Let's make it optional for backward compat but frontend sends it
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
    },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'confirmed', 'shipped', 'delivered', 'cancelled', 'failed'], default: 'pending' },
    shippingMethod: { type: String, required: true },
    paymentMode: { type: String, enum: ['RAZORPAY', 'COD'], required: true, default: 'RAZORPAY' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
