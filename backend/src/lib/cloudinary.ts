import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.warn('⚠️  CLOUDINARY_CLOUD_NAME is not set — image uploads will fail');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
        folder: 'prototerra/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    }),
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export { cloudinary };
