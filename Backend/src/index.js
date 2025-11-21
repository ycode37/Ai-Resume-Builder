import app from './app.js';
import { connectDB } from './db/index.js';
import { config } from 'dotenv';
config();

// Initialize connection immediately
connectDB();

export default app;
