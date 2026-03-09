import mongoose from 'mongoose';
import Product from '../models/Product';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

function slugify(name: string) {
    return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function migrate() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI not found');

        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        const products = await Product.find({ slug: { $exists: false } });
        console.log(`Found ${products.length} products without slugs`);

        for (const product of products) {
            const slug = slugify(product.name);

            // Check for uniqueness
            let uniqueSlug = slug;
            let counter = 1;
            while (await Product.findOne({ slug: uniqueSlug })) {
                uniqueSlug = `${slug}-${counter}`;
                counter++;
            }

            product.slug = uniqueSlug;
            await product.save();
            console.log(`Updated product ${product.name} with slug ${uniqueSlug}`);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
