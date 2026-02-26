import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const docs = await Product.find({});
        for (const doc of docs) {
            let currTags = doc.get('tags');
            let changed = false;

            if (Array.isArray(currTags)) {
                if (currTags.length === 1 && currTags[0] === '[]') {
                    doc.set('tags', []);
                    changed = true;
                } else if (currTags.length > 0 && typeof currTags[0] === 'string' && currTags[0].startsWith('[')) {
                    try {
                        let parsed = JSON.parse(currTags[0]);
                        if (Array.isArray(parsed)) {
                            doc.set('tags', parsed);
                            changed = true;
                        }
                    } catch (e) { }
                }
            }

            if (changed) {
                await doc.save();
                console.log(`Repaired tags for product: ${doc.get('name')}`);
            }
        }
        console.log("Done repairing tags.");
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

run();
