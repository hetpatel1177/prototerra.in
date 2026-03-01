// ⚠️  env.ts MUST be the very first import — loads .env.local before any
//     other module (e.g. cloudinary.ts) reads process.env
import './env';

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
    "https://prototerra.in",
    "https://www.prototerra.in",
    "https://admin.prototerra.in",
    "http://localhost:3000",
    "http://localhost:3001"
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

import reviewRoutes from './routes/reviews';
app.use('/api/reviews', reviewRoutes);

import contentRoutes from './routes/content';
app.use('/api/content', contentRoutes);

// Global JSON error handler — ensures Express never returns an HTML error page
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Express Error]', err);

    // Ensure CORS headers are present even on error responses
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    const status = err.status || (err.name === 'ValidationError' ? 400 : 500);
    res.status(status).json({
        success: false,
        error: err.message || 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`   Cloudinary cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
});
