// This file MUST be the very first import in index.ts
// It loads .env.local before any other module reads process.env
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });
