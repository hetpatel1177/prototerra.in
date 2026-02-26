import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: 'user' | 'admin';
    provider: 'credentials' | 'google';
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth users
    image: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    provider: { type: String, required: true, default: 'credentials' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
