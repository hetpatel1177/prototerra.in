import mongoose, { Schema, Document } from 'mongoose';

export interface IPageContent extends Document {
    slug: string; // 'our-story'
    hero: {
        title: string;
        subtitle: string;
        description: string;
        image: string;
    };
    philosophy: {
        heading: string;
        text1: string;
        text2: string;
        image: string;
    };
    process: {
        heading: string;
        description: string;
        steps: { title: string; desc: string; img: string }[];
    };
    team: {
        heading: string;
        description: string;
        members: { name: string; role: string; bio: string; img: string }[];
    };
}

const PageContentSchema: Schema = new Schema({
    slug: { type: String, required: true, unique: true },
    hero: {
        title: { type: String },
        subtitle: { type: String },
        description: { type: String },
        image: { type: String }
    },
    philosophy: {
        heading: { type: String },
        text1: { type: String },
        text2: { type: String },
        image: { type: String }
    },
    process: {
        heading: { type: String },
        description: { type: String },
        steps: [{
            title: String,
            desc: String,
            img: String
        }]
    },
    team: {
        heading: { type: String },
        description: { type: String },
        members: [{
            name: String,
            role: String,
            bio: String,
            img: String
        }]
    }
}, { timestamps: true });

export default mongoose.models.PageContent || mongoose.model<IPageContent>('PageContent', PageContentSchema);
