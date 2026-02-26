// ⚠️  env.ts MUST be the very first import — loads .env.local before any
//     other module (e.g. cloudinary.ts) reads process.env
import './env';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// DB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/prototerra';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (_req, res) => {
    res.send('ProtoTerra Backend API Running');
});

// Routes
import productRoutes from './routes/products';
import collectionRoutes from './routes/collections';
import orderRoutes from './routes/orders';
import seedRoutes from './routes/seed';
import authRoutes from './routes/auth';
import contactRoutes from './routes/contact'; // Contact Routes

app.use('/api/products', productRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes); // Register Contact Routes

import newsletterRoutes from './routes/newsletter';
app.use('/api/newsletter', newsletterRoutes);

import contentRoutes from './routes/content';
app.use('/api/content', contentRoutes);

// Global JSON error handler — ensures Express never returns an HTML error page
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Express Error]', err);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
